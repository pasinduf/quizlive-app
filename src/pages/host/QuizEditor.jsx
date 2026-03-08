import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import toast from 'react-hot-toast';
import ConfirmationModal from "../../components/ConfirmationModal";

function QuizEditor() {
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        order: 1,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        type: "primary",
    });

    useEffect(() => {
        fetchData();
    }, [quizId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [qRes, qsRes] = await Promise.all([
                api.get(`/quizzes/${quizId}`),
                api.get(`/questions/quiz/${quizId}?role=host`)
            ]);
            setQuiz(qRes.data);
            setQuestions(qsRes.data);
            setFormData((prev) => ({ ...prev, order: qsRes.data.length + 1 }));
        } catch (err) {
            console.error("Error fetching quiz data:", err);
        } finally {
            setLoading(false);
        }
    };

    const openConfirm = (title, message, onConfirm, type = "primary") => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                closeConfirm();
            },
            type,
        });
    };

    const closeConfirm = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/questions/${editingId}`, formData);
            } else {
                await api.post("/questions", { ...formData, quizId });
            }
            toast.success('Question saved!');
            setIsModalOpen(false);
            resetForm();
            const { data } = await api.get(`/questions/quiz/${quizId}?role=host`);
            setQuestions(data);
        } catch (err) {
            console.error("Error saving question:", err);
            toast.error('Failed to save question');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            questionText: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: "A",
            order: questions.length + 1,
        });
        setEditingId(null);
    };

    const editQuestion = (q) => {
        setEditingId(q._id);
        setFormData({
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            order: q.order,
        });
        setIsModalOpen(true);
    };

    const deleteQuestion = async (id) => {
        openConfirm(
            "Delete Question?",
            "Are you sure you want to delete this question? This action cannot be undone.",
            async () => {
                try {
                    await api.delete(`/questions/${id}`);
                    toast.success('Question deleted.');
                    setQuestions(questions.filter((q) => q._id !== id));
                } catch (err) {
                    console.error("Error deleting question:", err);
                    toast.error('Failed to delete question');
                }
            },
            "danger",
        );
    };

    if (loading)
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );

    return (
        <div className="page-container">
            <header className="page-header flex-between">
                <div>
                    <Link to="/quizzes" className="text-secondary text-sm mb-sm block">
                        ← Back to Quizzes
                    </Link>
                    <h1 className="page-title">{quiz?.title}</h1>
                    <p className="page-subtitle">Manage questions for this quiz ({questions.length} questions)</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                >
                    + Add Question
                </button>
            </header>

            {questions.length === 0 ? (
                <div className="card empty-state">
                    <p>No questions added to this quiz yet.</p>
                    <button className="btn btn-secondary mt-md" onClick={() => setIsModalOpen(true)}>
                        Add first question
                    </button>
                </div>
            ) : (
                <div className="grid-1">
                    {questions.map((q) => (
                        <div key={q._id} className="card mb-lg">
                            <div className="flex-between mb-md">
                                <span className="badge badge-waiting">Question {q.order}</span>
                                <div className="flex gap-sm">
                                    <button className="btn btn-secondary btn-sm" onClick={() => editQuestion(q)}>
                                        Edit
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => deleteQuestion(q._id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <h3 className="card-title mb-lg">{q.questionText}</h3>
                            <div className="grid-2">
                                <div className={`option-item ${q.correctAnswer === "A" ? "selected" : ""}`}>
                                    <span className="option-letter">A</span> {q.optionA}
                                </div>
                                <div className={`option-item ${q.correctAnswer === "B" ? "selected" : ""}`}>
                                    <span className="option-letter">B</span> {q.optionB}
                                </div>
                                <div className={`option-item ${q.correctAnswer === "C" ? "selected" : ""}`}>
                                    <span className="option-letter">C</span> {q.optionC}
                                </div>
                                <div className={`option-item ${q.correctAnswer === "D" ? "selected" : ""}`}>
                                    <span className="option-letter">D</span> {q.optionD}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: "600px" }}>
                        <h2 className="modal-title">{editingId ? "Edit Question" : "Add Question"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label text-sm">Question Text</label>
                                <textarea
                                    className="form-input"
                                    value={formData.questionText}
                                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                    required
                                    rows="3"
                                ></textarea>
                            </div>
                            <div className="options-stack">
                                <div className="form-group">
                                    <label className="form-label text-sm">Option A</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.optionA}
                                        onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-sm">Option B</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.optionB}
                                        onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-sm">Option C</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.optionC}
                                        onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-sm">Option D</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.optionD}
                                        onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label text-sm">Correct Answer</label>
                                    <select className="form-select" value={formData.correctAnswer} onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-sm">Question Order</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Question"}
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

export default QuizEditor;
