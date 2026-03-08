import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import socket from '../../socket';
import toast from 'react-hot-toast';

function Lobby() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const p = JSON.parse(localStorage.getItem(`quiz_player_${sessionId}`));
                if (!p) {
                    navigate(`/join/${sessionId}`);
                    return;
                }
                setPlayer(p);

                const { data: s } = await api.get(`/sessions/${sessionId}`);
                setSession(s);

                if (s.status === 'active') {
                    navigate(`/quiz/${sessionId}`);
                } else if (s.status === 'ended') {
                    toast.error('This session has already ended.');
                    navigate(`/join/${sessionId}`);
                }
            } catch (err) {
                console.error('Error fetching lobby data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        socket.connect();
        socket.emit('join-session', {
            sessionId,
            player: JSON.parse(localStorage.getItem(`quiz_player_${sessionId}`))
        });

        socket.on('session-started', () => {
            navigate(`/quiz/${sessionId}`);
        });

        return () => {
            socket.off('session-started');
            socket.disconnect();
        };
    }, [sessionId, navigate]);

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="page-container flex-center" style={{ minHeight: '100vh' }}>
            <div className="lobby-container card" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="flex-center flex-col gap-lg">
                    {player?.profilePicture ? (
                        <img src={player.profilePicture} alt={player.playerName} className="avatar avatar-xl" />
                    ) : (
                        <div className="avatar avatar-xl avatar-placeholder">{player?.playerName?.[0]}</div>
                    )}

                    <h2 className="page-title" style={{ fontSize: '1.8rem' }}>Welcome, {player?.playerName}!</h2>
                    <div className="badge badge-waiting">{player?.playerCode}</div>
                </div>

                <div className="mt-2xl">
                    <div className="lobby-icon">⏳</div>
                    <h3 className="lobby-title mt-lg">Waiting for the Host</h3>
                    <p className="lobby-message mt-md">The quiz will start automatically when the host is ready.</p>

                    <div className="flex-center mt-xl">
                        <div className="lobby-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>

                <div className="mt-2xl pt-xl border-t border-white/5 text-muted text-sm">
                    Session: {session?.quizId?.title}
                </div>
            </div>
        </div>
    );
}

export default Lobby;
