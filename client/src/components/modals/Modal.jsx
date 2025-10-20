import { Fragment } from 'react';
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  showDelete = false,
  onDelete,
  deleteLabel = "Delete",
  saveDisabled = false,
  size = "md" // sm, md, lg, xl
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="relative z-50"
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <DialogPanel
              className={`mx-auto ${sizeClasses[size]} w-full p-6 my-8 overflow-hidden text-left align-middle transition-all transform border-2 border-[var(--border-color)] shadow-2xl rounded-lg ring-4 ring-black/5`}
              style={{
                backgroundColor: 'var(--background-modal)',
                opacity: 1
              }}
            >
              <DialogTitle
                as="h3"
                className="text-xl font-semibold leading-6 text-[var(--text)] mb-1"
              >
                {title}
              </DialogTitle>
              <div className="w-12 h-1 bg-[var(--color-primary)] rounded-full mb-6"></div>

              <div className="mt-4">
                {children}
              </div>

              <div className="flex justify-between items-center gap-3 mt-8 pt-4 border-t border-[var(--border-color)]">
                {showDelete ? (
                  <button
                    type="button"
                    className="px-4 py-2.5 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 hover:border-red-500 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                    onClick={onDelete}
                  >
                    {deleteLabel}
                  </button>
                ) : <div />}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg hover:bg-[var(--background-primary)] hover:border-[var(--text-muted)] text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                  >
                    {cancelLabel}
                  </button>
                  {onSave && (
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={saveDisabled}
                      className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] shadow-sm"
                    >
                      {saveLabel}
                    </button>
                  )}
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;