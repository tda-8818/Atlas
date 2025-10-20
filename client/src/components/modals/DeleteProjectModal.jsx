import Modal from './Modal.jsx';

const DeleteProjectModal = ({ show, projectName, onDeleteConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <Modal
      isOpen={show}
      onClose={onCancel}
      title="Delete Project"
      onSave={onDeleteConfirm}
      saveLabel="Delete Project"
      showDelete={false}
      size="md"
    >
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-500/10 rounded-full">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-[var(--text)] mb-2">
            Are you sure you want to delete the project
          </p>
          <p className="text-lg font-semibold text-[var(--text)] mb-3">
            "{projectName}"?
          </p>
          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500 font-medium flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              This action cannot be undone
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;