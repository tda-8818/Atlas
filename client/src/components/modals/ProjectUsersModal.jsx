import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { UserMinusIcon } from '@heroicons/react/24/solid';
import { useInviteUserToProjectMutation } from '../../redux/slices/projectSlice';
import Modal from './Modal.jsx';

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

  const [inviteUserToProject] = useInviteUserToProjectMutation();

  useEffect(() => {
    if (show) {
      // Ensure all members including owner are in the current members list
      const members = allTeamMembers.filter(user =>
        initialSelectedMemberIds.includes(user._id)
      );

      // Make sure owner is included if not already
      const ownerInMembers = members.some(m => m._id === currentProjectOwnerId);
      if (!ownerInMembers && currentProjectOwnerId) {
        const owner = allTeamMembers.find(u => u._id === currentProjectOwnerId);
        if (owner) {
          members.unshift(owner); // Add owner at the beginning
        }
      }

      setCurrentMembers(members);
      setSelectedUsersToAdd([]);
      setQuery('');
    }
  }, [show, initialSelectedMemberIds, allTeamMembers, currentProjectOwnerId]);

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
      .includes(query)
  );

  const handleSave = async () => {
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
    <Modal
      isOpen={show}
      onClose={onClose}
      onSave={handleSave}
      title="Manage Team Members"
      saveLabel="Save Changes"
      size="lg"
    >
      {/* Search and Add Users */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Add Team Members
        </label>
        <Combobox value={''} onChange={setQuery}>
          <div className="relative">
            <Combobox.Input
              className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--text-muted)]"
              onChange={(e) => setQuery(e.target.value.toLowerCase())}
              displayValue={() => ''}
              placeholder="Search users by name or email..."
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Combobox.Button>

            <Combobox.Options className="absolute z-20 mt-2 w-full bg-[var(--background)] border border-[var(--border-color-accent)] rounded-lg shadow-lg max-h-60 overflow-y-auto focus:outline-none">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <Combobox.Option
                    key={user._id}
                    className={({ active }) =>
                      `cursor-pointer select-none px-4 py-3 transition-colors ${
                        active ? 'bg-[var(--color-primary)]/10 text-[var(--text)]' : 'text-[var(--text)]'
                      }`
                    }
                    value={user}
                    onClick={() => handleAddUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                      </div>
                      <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </Combobox.Option>
                ))
              ) : query !== '' ? (
                <div className="px-4 py-3 text-[var(--text-muted)] text-sm text-center">No users found.</div>
              ) : null}
            </Combobox.Options>
          </div>
        </Combobox>
      </div>

      {/* Users to be Added */}
      {selectedUsersToAdd.length > 0 && (
        <div className="mb-6 p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Pending Invitations ({selectedUsersToAdd.length})
            </h3>
            <span className="text-xs text-[var(--text-muted)]">Will be added on save</span>
          </div>
          <div className="space-y-2">
            {selectedUsersToAdd.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-2 bg-[var(--background-primary)] rounded-lg hover:bg-[var(--background)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center font-medium text-sm">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFromAdd(user)}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none"
                  title="Remove from list"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[var(--text)]">
            People with access
          </h3>
          <span className="text-xs text-[var(--text-muted)]">{currentMembers.length} {currentMembers.length === 1 ? 'person' : 'people'}</span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {currentMembers.length > 0 ? (
            currentMembers.map((user) => (
              <div key={user._id} className="group flex items-center justify-between p-3 bg-[var(--background-primary)] border border-[var(--border-color-accent)] rounded-lg hover:border-[var(--color-primary)]/30 transition-all">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-sm flex-shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-[var(--text)] truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      {user._id === currentProjectOwnerId && (
                        <span className="px-2 py-0.5 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-semibold rounded uppercase tracking-wide flex-shrink-0">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                </div>
                {user._id !== currentProjectOwnerId ? (
                  <button
                    onClick={() => handleRemoveCurrentUser(user._id)}
                    className="ml-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg transition-all focus:outline-none focus:opacity-100 flex-shrink-0"
                    title="Remove access"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                ) : (
                  <div className="w-10 flex-shrink-0"></div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center border border-dashed border-[var(--border-color-accent)] rounded-lg">
              <svg className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm text-[var(--text-muted)]">No members yet</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProjectUsersModal;
