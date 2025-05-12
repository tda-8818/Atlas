import React, { useState, useEffect } from 'react';
import { Dialog, Transition, DialogTitle, TransitionChild } from '@headlessui/react';
import { Combobox } from '@headlessui/react';
import { UserMinusIcon } from '@heroicons/react/24/solid';

const ProjectUsersModal = ({
  show,
  onClose,
  initialSelectedMemberIds = [],
  currentProjectOwnerId,
  onSave,
  allTeamMembers = [],
}) => {
  const [query, setQuery] = useState('');
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);

  useEffect(() => {
    if (show) {
      const members = allTeamMembers.filter(user =>
        initialSelectedMemberIds.includes(user._id)
      );
      setCurrentMembers(members);
      setSelectedUsersToAdd([]);
      setQuery('');
    }
  }, [show, initialSelectedMemberIds, allTeamMembers]);

  const handleAddUser = (user) => {
    if (!selectedUsersToAdd.some(u => u._id === user._id)) {
      setSelectedUsersToAdd(prev => [...prev, user]);
    }
  };

  const handleRemoveFromAdd = (userToRemove) => {
    setSelectedUsersToAdd(prev => prev.filter(user => user._id !== userToRemove._id));
  };

  const handleRemoveCurrentUser = (userId) => {
    if (userId !== currentProjectOwnerId) {
      setCurrentMembers(prev => prev.filter(user => user._id !== userId));
    }
  };

  const isUserAvailable = (user) =>
    !currentMembers.some(u => u._id === user._id) &&
    !selectedUsersToAdd.some(u => u._id === user._id);

  const filteredUsers = allTeamMembers.filter(user =>
    isUserAvailable(user) &&
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const handleSave = () => {
    const finalUserIds = [
      currentProjectOwnerId,
      ...currentMembers
        .filter(user => user._id !== currentProjectOwnerId)
        .map(user => user._id),
      ...selectedUsersToAdd.map(user => user._id),
    ];

    const uniqueUserIds = [...new Set(finalUserIds)];

    onSave(uniqueUserIds, currentProjectOwnerId);
    onClose();
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
          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          <TransitionChild
            as="div"
            className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-95"
            leaveTo="opacity-0"
          >
            <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Team Members
            </DialogTitle>

            <div className="mb-4">
              <Combobox value={''} onChange={setQuery}>
                <div className="relative mt-1">
                  <Combobox.Input
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    onChange={(e) => setQuery(e.target.value)}
                    displayValue={() => ''}
                    placeholder="Search users to add..."
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2" />

                  <Transition
                    as={React.Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                  >
                    <Combobox.Options className="absolute z-10 mt-1 w-full border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto focus:outline-none sm:text-sm">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <Combobox.Option
                            key={user._id}
                            className={({ active }) =>
                              `cursor-default select-none px-4 py-2 ${
                                active ? 'bg-blue-500 text-white' : 'text-gray-900'
                              }`
                            }
                            value={user}
                            onClick={() => handleAddUser(user)}
                          >
                            {user.firstName} {user.lastName} ({user.email})
                          </Combobox.Option>
                        ))
                      ) : query !== '' ? (
                        <div className="px-4 py-2 text-gray-700">No users found.</div>
                      ) : null}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
            </div>

            <div>
              <h3 className="mt-4 font-semibold text-gray-700">Add Users</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {selectedUsersToAdd.length > 0 ? (
                  selectedUsersToAdd.map((user) => (
                    <li key={user._id} className="py-3 flex items-center justify-between">
                      <span>{user.firstName} {user.lastName}</span>
                      <button
                        onClick={() => handleRemoveFromAdd(user)}
                        className="ml-2 focus:outline-none"
                        title="Remove from Add"
                      >
                        <UserMinusIcon className="h-5 w-5 text-red-500" />
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-gray-500">No users selected to add.</li>
                )}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-700">Current Members</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {currentMembers.length > 0 ? (
                  currentMembers.map((user) => (
                    <li key={user._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <span>{user.firstName} {user.lastName}</span>
                        {user._id === currentProjectOwnerId && (
                          <span className="ml-2 text-xs text-gray-500 italic">(Owner)</span>
                        )}
                      </div>
                      {user._id !== currentProjectOwnerId && (
                        <button
                          onClick={() => handleRemoveCurrentUser(user._id)}
                          className="ml-2 focus:outline-none"
                          title="Remove User"
                        >
                          <UserMinusIcon className="h-5 w-5 text-red-500" />
                        </button>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-gray-500">No current members.</li>
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
