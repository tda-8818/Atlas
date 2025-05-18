// src/components/DeleteProjectModal.jsx
import React, { useRef, useEffect } from 'react';

const DeleteProjectModal = ({ show, projectName, onDeleteConfirm, onCancel }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onCancel(); // close on outside click
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded shadow-lg p-6 w-[400px]"
      >
        <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Project</h3>
        <p className="mb-6 text-gray-700">
          Are you sure you want to delete the project "<span className="font-semibold">{projectName}</span>"? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onDeleteConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;