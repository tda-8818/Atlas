import { Field, Fieldset, Input, Label, Legend, Select, Textarea } from '@headlessui/react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'



function AddTaskPopup(props) {
  const { toggle, onSubmit, onClose } = props;

  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');

  const handleConfirm = () =>{
    onSubmit({title,description})

    setTitle('');
    setDescription('');
  };
  // const modalState = props.toggle;
  // const action = props.action;

  return (
    <Transition appear show={toggle} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
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

          <div className="fixed inset-0 overflow-y-auto ">
            <div className="flex min-h-full items-center justify-center p-4" >
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
             <Dialog.Panel className="max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">

                <Fieldset className="space-y-8 bg-white m-auto content-center w-[50vh] rounded-[6%]">
                  <Legend className="text-lg font-bold ml-[20px] mt-[10px]">Add a new task</Legend>
                  <Field>
                    <Label className="block ml-[20px]">Title</Label>
                    <Input className="mt-1 block bg-[#f5f5f7] ml-[20px] w-[80%]" name="title" value={title} onChange={(e) => setTitle(e.target.value)}/>
                  </Field>
                  {/* <Field>
                    <Label className="block ml-[20px]">Priority</Label>
                    <Select className="mt-1 block bg-[#f5f5f7] ml-[20px] cursor-pointer" name="priority">
                      <option>high</option>
                      <option>medium</option>
                      <option>low</option>
                    </Select>
                  </Field> */}
                  <Field>   
                    <Label className="block ml-[20px]">Description</Label>
                    <Textarea className="mt-1 block ml-[20px] w-[80%] bg-[#f5f5f7]" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </Field>
                  <Field className="flex justify-between ml-[20px] w-[80%]">
                    <button onClick={handleConfirm} className="flex justify-between rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">comfirm</button>
                    <button onClick={onClose} className="flex justify-between rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">cancel</button>
                  </Field>
            
                  
                </Fieldset>
                </Dialog.Panel>

              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
  )
}
export default AddTaskPopup