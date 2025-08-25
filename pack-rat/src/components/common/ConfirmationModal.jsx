import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-modal-content">
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="confirmation-modal-actions">
            <button 
              className="btn btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="btn btn-danger"
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
