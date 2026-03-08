import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import socket from '../../socket';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

function Quiz() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState(() => {
        const saved = localStorage.getItem(`quiz_answers_${sessionId}`);
        return saved ? JSON.parse(saved) : {};
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const questionsPerPage = 4;

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const player = JSON.parse(localStorage.getItem(`quiz_player_${sessionId}`));
                if (!player) {
                    navigate(`/join/${sessionId}`);
                    return;
                }

                const { data: qData } = await api.get(`/questions/session/${sessionId}?role=player`);
                setQuestions(qData);

                // Check if player already submitted
                const { data: subCheck } = await api.get(`/submissions/check/${sessionId}/${player._id}`);
                if (subCheck.submitted) {
                    navigate('/thankyou');
                    return;
                }

                const { data: sData } = await api.get(`/sessions/${sessionId}`);
                if (sData.status === 'ended') {
                    toast.error('This session has already ended.');
                    navigate(`/join/${sessionId}`);
                }
            } catch (err) {
                console.error('Error fetching questions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();

        socket.connect();
        socket.emit('join-session', {
            sessionId,
            player: JSON.parse(localStorage.getItem(`quiz_player_${sessionId}`))
        });

        socket.on('session-ended', () => {
            toast.error('The session was ended by the host.');
            navigate(`/join/${sessionId}`);
        });

        return () => {
            socket.off('session-ended');
            socket.disconnect();
        };
    }, [sessionId, navigate]);

    // Save answers to localStorage on change
    useEffect(() => {
        if (Object.keys(answers).length > 0) {
            localStorage.setItem(`quiz_answers_${sessionId}`, JSON.stringify(answers));
        }
    }, [answers, sessionId]);

    // Auto-scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const handleOptionSelect = (questionId, option) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
    };

    const totalPages = Math.ceil(questions.length / questionsPerPage);
    const currentQuestions = questions.slice(
        currentPage * questionsPerPage,
        (currentPage + 1) * questionsPerPage
    );

    const handleSubmit = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsConfirmOpen(false);
        setIsSubmitting(true);
        try {
            const player = JSON.parse(localStorage.getItem(`quiz_player_${sessionId}`));
            await api.post('/submissions', {
                playerId: player._id,
                sessionId,
                answers,
            });
            localStorage.removeItem(`quiz_answers_${sessionId}`);
            navigate('/thankyou');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="page-container" style={{ maxWidth: '800px' }}>
            <header className="page-header flex-between">
                <div>
                    <h1 className="page-title">Quiz in Progress</h1>
                    <p className="page-subtitle">Select your answers below</p>
                </div>
                <div className="quiz-progress-text">
                    Page {currentPage + 1} of {totalPages}
                </div>
            </header>

            <div className="quiz-progress">
                <div className="quiz-progress-bar">
                    <div
                        className="quiz-progress-fill"
                        style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="questions-list">
                {currentQuestions.map((q) => (
                    <div key={q._id} className="question-card">
                        <div className="question-number">Question {q.order}</div>
                        <div className="question-text">{q.questionText}</div>
                        <div className="options-list">
                            {['A', 'B', 'C', 'D'].map((opt) => (
                                <label
                                    key={opt}
                                    className={`option-item ${answers[q._id] === opt ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${q._id}`}
                                        value={opt}
                                        checked={answers[q._id] === opt}
                                        onChange={() => handleOptionSelect(q._id, opt)}
                                    />
                                    <span className="option-letter">{opt}</span>
                                    <span className="option-label">{q[`option${opt}`]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="quiz-nav">
                <button
                    className="btn btn-secondary"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    Previous
                </button>

                {currentPage === totalPages - 1 ? (
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next Page
                    </button>
                )}
            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                title="Submit Quiz?"
                message="Are you sure you want to submit your answers? You cannot change them after submitting."
                onConfirm={handleConfirmSubmit}
                onCancel={() => setIsConfirmOpen(false)}
                type="primary"
                confirmText="Submit Now"
            />
        </div>
    );
}

export default Quiz;
