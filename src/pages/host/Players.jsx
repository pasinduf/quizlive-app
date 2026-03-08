import { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

function Players() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        playerName: '',
        playerCode: '',
        profilePicture: null,
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'primary'
    });

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const { data } = await api.get('/players');
            setPlayers(data);
        } catch (err) {
            console.error('Error fetching players:', err);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profilePicture: file });
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('playerName', formData.playerName);
            data.append('playerCode', formData.playerCode);

            if (formData.profilePicture instanceof File) {
                data.append('profilePicture', formData.profilePicture);
            }

            if (editingId) {
                await api.put(`/players/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Player updated successfully!');
            } else {
                await api.post('/players', data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Player registered successfully!');
            }

            setIsModalOpen(false);
            setFormData({ playerName: '', playerCode: '', profilePicture: null });
            setEditingId(null);
            setPreviewUrl(null);
            fetchPlayers();
        } catch (err) {
            console.error('Error saving player:', err);
            toast.error(err.response?.data?.error || `Failed to ${editingId ? 'update' : 'add'} player`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const editPlayer = (player) => {
        setEditingId(player._id);
        setFormData({
            playerName: player.playerName,
            playerCode: player.playerCode,
            profilePicture: player.profilePicture,
        });
        setPreviewUrl(player.profilePicture);
        setIsModalOpen(true);
    };

    const deletePlayer = async (id) => {
        openConfirm(
            'Delete Player?',
            'Are you sure you want to delete this player?',
            async () => {
                try {
                    await api.delete(`/players/${id}`);
                    toast.success('Player deleted.');
                    fetchPlayers();
                } catch (err) {
                    console.error('Error deleting player:', err);
                    toast.error('Failed to delete player');
                }
            },
            'danger'
        );
    };

    return (
        <div className="page-container">
            <header className="page-header flex-between">
                <div>
                    <h1 className="page-title">Player Registration</h1>
                    <p className="page-subtitle">Pre-register players with their unique codes</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    + Register Player
                </button>
            </header>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading players...</p>
                </div>
            ) : players.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">👥</div>
                    <p>No players registered yet</p>
                    <button className="btn btn-secondary mt-md" onClick={() => setIsModalOpen(true)}>
                        Add your first player
                    </button>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Profile</th>
                                <th>Name</th>
                                <th>Player Code</th>
                                <th>Registered At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player) => (
                                <tr key={player._id}>
                                    <td>
                                        {player.profilePicture ? (
                                            <img src={player.profilePicture} alt={player.playerName} className="avatar" />
                                        ) : (
                                            <div className="avatar avatar-placeholder">
                                                {player.playerName.charAt(0)}
                                            </div>
                                        )}
                                    </td>
                                    <td>{player.playerName}</td>
                                    <td>
                                        <span className="badge badge-waiting">{player.playerCode}</span>
                                    </td>
                                    <td className="text-secondary text-sm">
                                        {new Date(player.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => editPlayer(player)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deletePlayer(player._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2 className="modal-title">{editingId ? 'Edit Player' : 'Register New Player'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label text-sm">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.playerName}
                                    onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                                    required
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label text-sm">Player Code</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.playerCode}
                                    onChange={(e) => setFormData({ ...formData, playerCode: e.target.value })}
                                    required
                                    placeholder="e.g. A101"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label text-sm">Profile Picture</label>
                                <div className="file-upload">
                                    {previewUrl && <img src={previewUrl} alt="Preview" className="file-preview" />}
                                    <label htmlFor="pf-upload" className="file-upload-btn">
                                        {formData.profilePicture ? 'Change Image' : 'Select Image'}
                                    </label>
                                    <input
                                        type="file"
                                        id="pf-upload"
                                        className="file-upload-input"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {formData.profilePicture && (
                                        <span className="text-sm text-secondary">{formData.profilePicture.name}</span>
                                    )}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setPreviewUrl(null);
                                        setEditingId(null);
                                        setFormData({ playerName: '', playerCode: '', profilePicture: null });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? (editingId ? 'Updating...' : 'Registering...') : (editingId ? 'Update Player' : 'Register')}
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

export default Players;
