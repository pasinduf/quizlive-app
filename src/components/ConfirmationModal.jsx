import React from 'react';

function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'primary' // primary, danger, warning
}) {
    if (!isOpen) return null;

    const getBtnClass = () => {
        switch (type) {
            case 'danger': return 'btn-danger';
            case 'warning': return 'btn-warning';
            default: return 'btn-primary';
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '400px' }}>
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message mb-xl" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                    {message}
                </p>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`btn ${getBtnClass()}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
