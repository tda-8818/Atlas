import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import DeleteTaskPopup from './DeleteTaskPopup';

export default function ViewTaskModal(props) {
    const { toggle, action, onSubmit } = props;

    const [childModalState, setChildModalState] = useState(false);

    const openChildModal = () =>{
      setChildModalState(!childModalState)
    };

    const handleChildConfirm = () => {
      // Optionally, perform deletion or any async operations.
      onSubmit();
  
      // Close the child modal.
      setChildModalState(false);
  
      // Close the parent modal.
      action();
    };
  

  return (
    <>

      <Transition appear show={toggle} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={action}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Task Details
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus iusto perspiciatis nesciunt rerum consequuntur quos praesentium totam inventore expedita molestiae, odit fuga fugit nobis ea culpa aperiam deleniti ut explicabo.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={action}
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={openChildModal}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <DeleteTaskPopup toggle={childModalState} onSubmit={handleChildConfirm} onClose={openChildModal} />
    </>
  )
}
