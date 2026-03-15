import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'primary'
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('/quizzes');
      setQuizzes(data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
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

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/quizzes', { title: newQuizTitle });
      toast.success('Quiz created successfully!');
      setIsModalOpen(false);
      setNewQuizTitle('');
      fetchQuizzes();
    } catch (err) {
      console.error('Error creating quiz:', err);
      toast.error('Failed to create quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startSession = async (quizId) => {
    openConfirm(
      'Start Session?',
      'This will create a new session and generate a join code for players.',
      async () => {
        try {
          await api.post('/sessions', { quizId });
          toast.success('Session started!');
          navigate('/sessions');
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to start session');
        }
      }
    );
  };

  const deleteQuiz = async (id) => {
    openConfirm(
      'Delete Quiz?',
      'Are you sure you want to delete this quiz and all its questions? This action cannot be undone.',
      async () => {
        try {
          await api.delete(`/quizzes/${id}`);
          toast.success('Quiz deleted.');
          fetchQuizzes();
        } catch (err) {
          console.error('Error deleting quiz:', err);
          toast.error('Failed to delete quiz');
        }
      },
      'danger'
    );
  };

  return (
    <div className="page-container">
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">Manage Quizzes</h1>
          <p className="page-subtitle">Create and organize your quiz content</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Create Quiz
        </button>
      </header>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading quizzes...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📝</div>
          <p>No quizzes created yet</p>
          <button className="btn btn-secondary mt-md" onClick={() => setIsModalOpen(true)}>
            Create your first quiz
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="card quiz-card">
              <div className="card-header pb-sm">
                <h3 className="card-title">{quiz.title}</h3>
                {quiz.hasActiveSession && <span className="badge badge-active">{quiz.currentSessionStatus}</span>}
              </div>
              <p className="text-secondary text-sm">{quiz.questionCount || 0} Questions</p>
              <p className="text-secondary text-sm mb-lg">Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
              <div className="flex gap-sm">
                {!quiz.hasActiveSession && (
                  <>
                    <Link to={`/quizzes/${quiz._id}/questions`} className="btn btn-primary btn-sm flex-1">
                      Edit Questions
                    </Link>
                    <button className="btn btn-icon btn-secondary" style={{ color: "var(--danger)" }} onClick={() => deleteQuiz(quiz._id)}>
                      🗑️
                    </button>
                  </>
                )}

                {!quiz.hasActiveSession && (
                  <button className="btn btn-secondary btn-sm" disabled={quiz.hasActiveSession} onClick={() => startSession(quiz._id)}>
                    Start
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Create New Quiz</h2>
            <form onSubmit={handleCreateQuiz}>
              <div className="form-group">
                <label className="form-label text-sm">Quiz Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  required
                  placeholder="e.g. General Knowledge 2026"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Quiz"}
                </button>
              </div>
            </form>
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

export default QuizList;
