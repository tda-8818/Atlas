// ProjectUsersModal.jsx
import { useState, useEffect } from 'react';
import { Dialog, Transition, DialogTitle, TransitionChild } from '@headlessui/react';

const ProjectUsersModal = ({
  show,
  onClose,
  initialSelectedMemberIds = [],
  currentProjectOwnerId,
  onSave,
  allTeamMembers = []
}) => {
  // Local state to track which users are selected
  const [selectedMembers, setSelectedMembers] = useState(initialSelectedMemberIds);
  // State for current search term
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search term (client-side filtering)
  const filteredUsers = allTeamMembers.filter((user) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Initialize selected members when modal opens
    if (show) {
      setSelectedMembers(initialSelectedMemberIds);
    }
  }, [show, initialSelectedMemberIds]);

  // Toggle user selection from list
  const handleToggleUser = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Handler to update owner (for simplicity, you might allow owner selection separately)
  const handleOwnerChange = (e) => {
    // For example, you can allow the modal to pick an owner from the filtered list
    // This is a simple stub: for a production app, you might use a dropdown.
    // If needed, add new state for newOwner and pass it with onSave.
  };

  const handleSave = () => {
    // Here you would also send back the new owner if that is modifiable
    const newOwnerId = currentProjectOwnerId;
    onSave(selectedMembers, newOwnerId);
  };

  return (
    <Transition appear show={show} as="div">
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <TransitionChild
            as="div"
            className="fixed inset-0 bg-black bg-opacity-30"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          />
          {/* Trick the browser into centering the modal contents */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <TransitionChild
            as="div"
            className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Update Project Members
            </DialogTitle>
            <div className="mb-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Users
              </label>
              <input
                id="search"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 p-2"
                placeholder="Type a name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto mb-4">
              <ul>
                {filteredUsers.map((user) => (
                  <li key={user._id} className="flex items-center justify-between py-1">
                    <span>{user.firstName} {user.lastName}</span>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => handleToggleUser(user._id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </li>
                ))}
                {filteredUsers.length === 0 && (
                  <li className="text-gray-500 text-sm">No users found.</li>
                )}
              </ul>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProjectUsersModal;