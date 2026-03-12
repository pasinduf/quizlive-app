import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

function Leaderboard() {
    const { sessionId } = useParams();
    const [leaderboard, setLeaderboard] = useState([]);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const [lRes, sRes] = await Promise.all([
                    api.get(`/submissions/leaderboard/${sessionId}`),
                    api.get(`/sessions/${sessionId}`),
                ]);
                setLeaderboard(lRes.data);
                setSession(sRes.data);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [sessionId]);

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="page-container">
            <header className="page-header text-center">
                <h1 className="page-title">Leaderboard: {session?.quizId?.title}</h1>
                <p className="page-subtitle">Top performers based on correct answers</p>
            </header>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '20px' }}>
                {leaderboard.length === 0 ? (
                    <div className="empty-state">
                        <p>No submissions yet for this session.</p>
                    </div>
                ) : (
                    <div className="leaderboard-list">
                        {leaderboard.map((item) => (
                            <div key={item.playerCode} className="leaderboard-item">
                                <div className="leaderboard-rank">{item.rank}</div>
                                <img
                                    src={item.profilePicture || `https://ui-avatars.com/api/?name=${item.playerName}`}
                                    alt={item.playerName}
                                    className="avatar avatar-lg"
                                />
                                <div className="leaderboard-info">
                                    <div className="leaderboard-name">{item.playerName}</div>
                                    <div className="text-secondary text-sm">Code: {item.playerCode}</div>
                                </div>
                                <div className="leaderboard-score">
                                    {item.correctAnswerCount} / {session?.totalQuestions || 0}
                                </div>
                                <div className="text-muted text-sm ml-lg">
                                    {new Date(item.submissionTime).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-center mt-2xl">
                <Link to="/sessions" className="btn btn-secondary">Back to Sessions</Link>
            </div>
        </div>
    );
}

export default Leaderboard;
