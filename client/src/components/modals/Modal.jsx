import React, { Fragment } from 'react';
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
  deleteLabel = "Delete"
}) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="relative z-10"
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="mx-auto max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md">
              <DialogTitle
                as="h3"
                className="text-lg font-medium leading-6 text-[var(--color-primary)]"
              >
                {title}
              </DialogTitle>
              <div className="mt-2">
                {children}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                {showDelete && (
                  <button
                    type="button"
                    className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 text-sm"
                    onClick={onDelete}
                  >
                    {deleteLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded hover:bg-blue-50 text-sm"
                >
                  {cancelLabel}
                </button>
                {onSave && (
                  <button
                    type="button"
                    onClick={onSave}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-)] text-sm disabled:opacity-50"
                  >
                    {saveLabel}
                  </button>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;