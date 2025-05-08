import { Fragment, useRef } from 'react';
import { Dialog, Transition, DialogTitle, TransitionChild } from '@headlessui/react';

export const ModalContainer = ({
    isOpen,          // Boolean controlling whether the modal is visible or hidden.
    onClose,         // Callback function to run when the user wants to cancel/close the modal.
    title,           // The title text displayed at the top of the modal.
    onSave,          // Callback function to run when the user is ready to save/apply changes.
    children,        // The main body content of the modal (usually passed as nested JSX).
    saveButtonText = "Save",    // Optional text for the save button; defaults to "Save".
    cancelButtonText = "Cancel" // Optional text for the cancel button; defaults to "Cancel".
}) => {
    const cancelButtonRef = useRef(null);

    console.log('modal children', children)
    return (
        <Transition
            show={isOpen}
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" initialFocus={cancelButtonRef} onClose={onClose} >
                <div className="flex min-h-screen items-center justify-center p-4 text-center">
                    {/* Background Overlay */}
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            className="fixed inset-0 bg-black/10 backdrop-blur-[2px]"
                            aria-hidden="true"
                        />
                    </TransitionChild>

                    {/* Trick for centering the modal */}
                    <span
                        className="hidden sm:inline-block sm:h-screen sm:align-middle"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>

                    {/* Modal Container */}
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="inline-block w-full max-w-[400px] overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all align-middle">
                            {/* Title */}
                            <DialogTitle as="h3" className="text-lg font-semibold mb-4 text-gray-800">
                                {title}
                            </DialogTitle>

                            {/* Modal Content */}
                            <div>
                                {children}
                            </div>

                            {/* Save/Cancel Buttons */}
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    onClick={onClose}
                                    ref={cancelButtonRef}
                                >
                                    {cancelButtonText}
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    onClick={onSave}
                                >
                                    {saveButtonText}
                                </button>
                            </div>
                        </div>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ModalContainer;