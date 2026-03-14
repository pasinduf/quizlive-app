import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

function Join() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [playerCode, setPlayerCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [session, setSession] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data } = await api.get(`/sessions/${sessionId}`);
                setSession(data);
                if (data.status === 'ended') {
                    setError('This quiz session has already ended.');
                }
            } catch (err) {
                setError('Invalid session link.');
            }
        };
        fetchSession();
    }, [sessionId]);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!playerCode) return;

        setLoading(true);
        setError('');

        try {

            const { data: player } = await api.post('/players/validate', {
                playerCode: playerCode.toUpperCase(),
                sessionId,
            });

             const { data: subCheck } = await api.get(`/submissions/check/${sessionId}/${player._id}`);
             if (subCheck.submitted) {
               navigate('/thankyou');
               return;
             }

            // Store player and session info in localStorage
            localStorage.setItem(`quiz_player_${sessionId}`, JSON.stringify(player));

            // Redirect to lobby
            navigate(`/lobby/${sessionId}`);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Invalid player code. Please check and try again.');
            } else {
                setError('Failed to join. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="join-container">
            <div className="join-card">
                <h1 className="join-title">Join Quiz</h1>
                <p className="join-subtitle">
                    {session ? `Session: ${session.quizId?.title}` : 'Enter your player code to participate'}
                </p>

                {error && <div className="join-error">{error}</div>}

                <form onSubmit={handleJoin}>
                    <div className="form-group">
                        <label className="form-label text-sm">Enter Player Code</label>
                        <input
                            type="text"
                            className="form-input text-center"
                            style={{ fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}
                            value={playerCode}
                            onChange={(e) => setPlayerCode(e.target.value)}
                            placeholder="e.g. A102"
                            required
                            disabled={loading || (session && session.status === 'ended')}
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        style={{ width: '100%' }}
                        disabled={loading || !playerCode || (session && session.status === 'ended')}
                    >
                        {loading ? 'Joining...' : 'Join Quiz'}
                    </button>
                </form>

                <p className="text-muted text-sm mt-xl">
                    Only pre-registered players can join.
                </p>
            </div>
        </div>
    );
}

export default Join;
