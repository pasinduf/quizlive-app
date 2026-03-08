import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import socket from '../../socket';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

function Monitor() {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sRes, subRes, pRes] = await Promise.all([
                    api.get(`/sessions/${sessionId}`),
                    api.get(`/submissions/session/${sessionId}`),
                    api.get('/players'),
                ]);
                setSession(sRes.data);
                setSubmissions(subRes.data);
                setPlayers(pRes.data);
            } catch (err) {
                console.error('Error fetching monitor data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        socket.connect();
        socket.emit('host-join-session', { sessionId });

        socket.on('submission-received', (data) => {
            setSubmissions((prev) => {
                // Prevent duplicate real-time events from adding same player
                if (prev.find(s => s.playerId?._id === data.playerId || s.playerId === data.playerId)) return prev;
                return [...prev, {
                    playerId: { _id: data.playerId, playerName: data.playerName, profilePicture: data.profilePicture },
                    submissionTime: new Date()
                }];
            });
        });

        socket.on('player-joined', (data) => {
            console.log('Player joined lobby:', data);
        });

        return () => {
            socket.off('submission-received');
            socket.off('player-joined');
            socket.disconnect();
        };
    }, [sessionId]);

    const endSession = async () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmEnd = async () => {
        setIsConfirmOpen(false);
        try {
            await api.post(`/sessions/${sessionId}/end`);
            toast.success('Session ended.');
            window.location.href = `/sessions/${sessionId}/leaderboard`;
        } catch (err) {
            toast.error('Failed to end session');
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    const sortedPlayers = [...players].sort((a, b) => {
        const subA = submissions.find(s => (s.playerId?._id || s.playerId) === a._id);
        const subB = submissions.find(s => (s.playerId?._id || s.playerId) === b._id);

        if (subA && subB) {
            return new Date(subA.submissionTime) - new Date(subB.submissionTime);
        }
        if (subA) return -1;
        if (subB) return 1;
        return 0;
    });

    return (
        <div className="page-container">
            <Link to="/sessions" className="back-link">← Back to Sessions</Link>
            <header className="page-header flex-between">
                <div>
                    <h1 className="page-title">Monitoring: {session?.quizId?.title}</h1>
                    <p className="page-subtitle">Real-time submission dashboard</p>
                </div>
                <button className="btn btn-danger" onClick={endSession}>End Quiz & View Leaderboard</button>
            </header>

            <div className="stat-cards">
                <div className="stat-card">
                    <div className="stat-value">{players.length}</div>
                    <div className="stat-label">Total Registered</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{submissions.length}</div>
                    <div className="stat-label">Submissions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{players.length - submissions.length}</div>
                    <div className="stat-label">Pending</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Submission Progress</h2>
                    <span className="badge badge-active">Live Updates</span>
                </div>

                <div className="submission-grid mt-lg">
                    {sortedPlayers.map((player) => {
                        const submission = submissions.find(
                            (s) => (s.playerId?._id || s.playerId) === player._id
                        );
                        const subIndex = submission ? submissions.indexOf(submission) + 1 : null;

                        return (
                            <div key={player._id} className={`submission-slot ${submission ? 'filled' : ''}`}>
                                {submission ? (
                                    <>
                                        <img
                                            src={player.profilePicture || `https://ui-avatars.com/api/?name=${player.playerName}`}
                                            alt={player.playerName}
                                            className="avatar"
                                        />
                                        <div className="order-num">{subIndex}️⃣</div>
                                        <div className="player-name">{player.playerName}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="slot-empty"></div>
                                        <div className="player-name">{player.playerName}</div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                title="End session now?"
                message="This will stop all submissions and take you to the leaderboard. Are you sure?"
                onConfirm={handleConfirmEnd}
                onCancel={() => setIsConfirmOpen(false)}
                type="warning"
                confirmText="End Quiz"
            />
        </div>
    );
}

export default Monitor;
