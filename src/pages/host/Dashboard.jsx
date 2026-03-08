import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function Dashboard() {
    const [stats, setStats] = useState({
        players: 0,
        quizzes: 0,
        sessions: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [p, q, s] = await Promise.all([
                    api.get('/players'),
                    api.get('/quizzes'),
                    api.get('/sessions'),
                ]);
                setStats({
                    players: p.data.length,
                    quizzes: q.data.length,
                    sessions: s.data.length,
                });
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <h1 className="page-title">Host Dashboard</h1>
                <p className="page-subtitle">Manage your players, quizzes, and live sessions</p>
            </header>

            <div className="stat-cards">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{stats.players}</div>
                    <div className="stat-label">Registered Players</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">{stats.quizzes}</div>
                    <div className="stat-label">Total Quizzes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎮</div>
                    <div className="stat-value">{stats.sessions}</div>
                    <div className="stat-label">Quiz Sessions</div>
                </div>
            </div>

            <div className="grid-3">
                <Link to="/players" className="card text-center">
                    <div className="page-title" style={{ fontSize: '1.5rem' }}>Manage Players</div>
                    <p className="text-secondary mb-lg">Register and view player records</p>
                    <span className="btn btn-primary btn-sm">Go to Players</span>
                </Link>
                <Link to="/quizzes" className="card text-center">
                    <div className="page-title" style={{ fontSize: '1.5rem' }}>Manage Quizzes</div>
                    <p className="text-secondary mb-lg">Create and edit quiz questions</p>
                    <span className="btn btn-primary btn-sm">Go to Quizzes</span>
                </Link>
                <Link to="/sessions" className="card text-center">
                    <div className="page-title" style={{ fontSize: '1.5rem' }}>Quiz Sessions</div>
                    <p className="text-secondary mb-lg">Start sessions and view leaderboard</p>
                    <span className="btn btn-primary btn-sm">Go to Sessions</span>
                </Link>
            </div>
        </div>
    );
}

export default Dashboard;
