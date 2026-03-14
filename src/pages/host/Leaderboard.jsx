import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../../api';

function Leaderboard() {
    const { sessionId } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isLiveReveal = searchParams.get('reveal') === 'true';

    const [leaderboard, setLeaderboard] = useState([]);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    // If not a live reveal, show leaderboard immediately once loading is done
    const [showLeaderboard, setShowLeaderboard] = useState(!isLiveReveal);

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

    useEffect(() => {
        if (!loading && isLiveReveal) {
            const anticipationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
            anticipationSound.play().catch(e => console.error('Error playing sound:', e));

            const timer = setTimeout(() => {
                setShowLeaderboard(true);
            }, 5000);

            return () => clearTimeout(timer);
        } else if (!loading && !isLiveReveal) {
            setShowLeaderboard(true);
        }
    }, [loading, isLiveReveal]);

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    if (!showLeaderboard) {
        return (
            <div className="page-container flex-center" style={{ minHeight: '60vh' }}>
                <div className="anticipation-container">
                    <div className="anticipation-spinner"></div>
                    <div className="anticipation-text">Calculating Results... Get Ready!</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header text-center reveal-item">
                <h1 className="page-title">Leaderboard: {session?.quizId?.title}</h1>
                <p className="page-subtitle">Top performers based on correct answers</p>
            </header>

            <div className="card reveal-item delay-1" style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '20px' }}>
                {leaderboard.length === 0 ? (
                    <div className="empty-state">
                        <p>No submissions yet for this session.</p>
                    </div>
                ) : (
                    <div className="leaderboard-list">
                        {leaderboard.map((item, index) => (
                            <div
                                key={item.playerCode}
                                className={`leaderboard-item reveal-item delay-${Math.min(index + 2, 10)}`}
                            >
                                <div className="leaderboard-rank">{item.rank}</div>
                                {item.profilePicture ? (
                                    <img
                                        src={item.profilePicture}
                                        alt={item.playerName}
                                        className="avatar avatar-lg"
                                    />
                                ) : (
                                    <div className="avatar avatar-lg avatar-placeholder">
                                        {item.playerName?.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
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
                            </div >
                        ))}
                    </div >
                )}
            </div >

            <div className="text-center mt-2xl reveal-item delay-10">
                <Link to="/sessions" className="btn btn-secondary">Back to Sessions</Link>
            </div>
        </div >
    );
}

export default Leaderboard;
