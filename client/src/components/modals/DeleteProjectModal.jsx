// src/components/DeleteProjectModal.jsx
import React, { useRef, useEffect } from 'react';
import Modal from './Modal.jsx';

const DeleteProjectModal = ({ show, projectName, onDeleteConfirm, onCancel }) => {
 
  if (!show) return null;

  return (
    <Modal
      isOpen={show}
      onClose={onCancel}
      title="Delete Project"
      onSave={onDeleteConfirm}
      saveLabel={"Delete Project"}
      >
        <p className="mb-6 text-gray-700">
          Are you sure you want to delete the project "<span className="font-semibold">{projectName}</span>"? This action cannot be undone.
        </p>
   </Modal>
  );
};

export default DeleteProjectModal;