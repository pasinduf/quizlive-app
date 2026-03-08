import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrModal, setQrModal] = useState(null);

    // Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'primary'
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const { data } = await api.get('/sessions');
            setSessions(data);
        } catch (err) {
            console.error('Error fetching sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    const openConfirm = (title, message, onConfirm, type = 'primary') => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                closeConfirm();
            },
            type
        });
    };

    const closeConfirm = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };

    const showQR = async (sessionId) => {
        try {
            const { data } = await api.get(`/sessions/${sessionId}/qr`);
            setQrModal(data);
        } catch (err) {
            toast.error('Failed to load QR code');
        }
    };

    const startQuiz = async (id) => {
        openConfirm(
            'Start Quiz?',
            'This will make the quiz active for all joined players.',
            async () => {
                try {
                    await api.post(`/sessions/${id}/start`);
                    toast.success('Session started successfully!');
                    fetchSessions();
                } catch (err) {
                    toast.error('Failed to start session');
                }
            }
        );
    };

    const endQuiz = async (id) => {
        openConfirm(
            'End Session?',
            'No more submissions will be allowed. This will finalise the leaderboard.',
            async () => {
                try {
                    await api.post(`/sessions/${id}/end`);
                    toast.success('Session ended.');
                    fetchSessions();
                } catch (err) {
                    toast.error('Failed to end session');
                }
            },
            'warning'
        );
    };

    const deleteSession = async (id) => {
        openConfirm(
            'Delete Session?',
            'Are you sure you want to delete this session?',
            async () => {
                try {
                    await api.delete(`/sessions/${id}`);
                    toast.success('Session deleted.');
                    fetchSessions();
                } catch (err) {
                    toast.error('Failed to delete session');
                }
            },
            'danger'
        );
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <h1 className="page-title">Quiz Sessions</h1>
                <p className="page-subtitle">Monitored live quiz sessions and leaderboards</p>
            </header>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : sessions.length === 0 ? (
                <div className="card empty-state">
                    <p>No sessions created. Go to Quizzes to start one.</p>
                    <Link to="/quizzes" className="btn btn-primary mt-md">Go to Quizzes</Link>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Quiz Title</th>
                                <th>Status</th>
                                <th>Started At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((s) => (
                                <tr key={s._id}>
                                    <td>{s.quizId?.title}</td>
                                    <td>
                                        <span className={`badge badge-${s.status}`}>{s.status}</span>
                                    </td>
                                    <td>{s.startTime ? new Date(s.startTime).toLocaleString() : '-'}</td>
                                    <td>
                                        <div className="flex gap-sm">

                                            {s.status !== 'ended' &&
                                              <button className="btn btn-secondary btn-sm" onClick={() => showQR(s._id)}>QR Code</button>
                                            }

                                            {s.status === 'waiting' && (
                                                <button className="btn btn-success btn-sm" onClick={() => startQuiz(s._id)}>Start Quiz</button>
                                            )}

                                            {s.status === 'active' && (
                                                <>
                                                    <Link to={`/sessions/${s._id}/monitor`} className="btn btn-primary btn-sm">Monitor</Link>
                                                    <button className="btn btn-warning btn-sm" onClick={() => endQuiz(s._id)}>End Quiz</button>
                                                </>
                                            )}

                                            {s.status !== 'active' && (
                                                <button className="btn btn-danger btn-sm" onClick={() => deleteSession(s._id)}>Delete</button>
                                            )}

                                            {s.status === 'ended' && (
                                                <Link to={`/sessions/${s._id}/leaderboard`} className="btn btn-warning btn-sm">Leaderboard</Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {qrModal && (
                <div className="modal-overlay">
                    <div className="modal text-center">
                        <h2 className="modal-title">Join Quiz Session</h2>
                        <div className="qr-container">
                            <img src={qrModal.qrCode} alt="Join QR Code" />
                            <p className="qr-url">{qrModal.joinUrl}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setQrModal(null)}>Close</button>
                            <button className="btn btn-primary" onClick={() => window.open(qrModal.joinUrl, '_blank')}>Open Link</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirm}
                type={confirmModal.type}
            />
        </div>
    );
}

export default Sessions;
