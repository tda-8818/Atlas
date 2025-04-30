import { Field, Fieldset, Input, Label, Legend, Textarea } from '@headlessui/react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import DeleteTaskPopup from './DeleteTaskPopup'

function AddTaskPopup(props) {
  const { toggle, onSubmit, onClose, onDelete, event } = props
  const [childModalState, setChildModalState] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Populate form when editing
  useEffect(() => {
    if (event) {
      setTitle(event.title || '')
      setDescription(event.extendedProps?.description || '')
    } else {
      setTitle('')
      setDescription('')
    }
  }, [event])

  const handleConfirm = () => {
    onSubmit({ title, description })
    setTitle('')
    setDescription('')
  }

  const openChildModal = () => {
    setChildModalState(!childModalState)
  }

  const handleChildConfirm = () => {
    onDelete()
    setChildModalState(false)
    onClose()
  }

  return (
    <>
      <Transition appear show={toggle} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-4"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Fieldset className="space-y-6">
                    <Legend className="text-xl font-semibold text-gray-800">Add a New Task</Legend>

                    <Field>
                      <Label className="block text-sm font-medium text-gray-700">Title</Label>
                      <Input
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-200"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label className="block text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-200"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Field>

                    <div className="flex justify-between gap-2 pt-2">
                      <button
                        onClick={handleConfirm}
                        className="w-full rounded-md bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        Confirm
                      </button>
                      {event && (
                        <button
                          onClick={openChildModal}
                          className="w-full rounded-md bg-red-100 text-red-700 py-2 text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Delete
                        </button>
                      )}
                      <button
                        onClick={onClose}
                        className="w-full rounded-md bg-gray-100 text-gray-800 py-2 text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </Fieldset>
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

export default AddTaskPopup
