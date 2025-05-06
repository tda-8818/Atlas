// src/components/UserAssignmentModal.jsx
import React, { useState, useEffect, useRef } from 'react';

// You might need to pass this list or fetch it here
// For now, using the same static list as Home.jsx
const allTeamMembers = [
  { id: "user-1", name: "Alex Johnson", avatar: "/avatars/avatar1.png", initials: "AJ" },
  { id: "user-2", name: "Sarah Wilson", avatar: "/avatars/avatar2.png", initials: "SW" },
  { id: "user-3", name: "David Chen", avatar: "/avatars/avatar3.png", initials: "DC" },
  { id: "user-4", name: "Emma Rodriguez", avatar: "/avatars/avatar4.png", initials: "ER" },
  { id: "user-5", name: "Michael Brown", avatar: "/avatars/avatar5.png", initials: "MB" },
];

// Helper to get initials from name
const getInitialsFromName = (name = '') => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else if (name.length > 0) {
        return name[0].toUpperCase();
    }
    return '';
};

// Receive currentProjectOwnerId to prevent removing the owner from the list
const UserAssignmentModal = ({ show, initialSelectedMemberIds, currentProjectOwnerId, onSave, onCancel }) => {
  // State for selected team members
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Effect to initialize state when the modal opens or initial props change
  useEffect(() => {
    if (show) {
      // Initialize selected members with the initial list passed in
      // Ensure initialSelectedMemberIds is an array
      setSelectedMemberIds(Array.isArray(initialSelectedMemberIds) ? initialSelectedMemberIds : []);
      setSearchQuery('');
      // Focus the search input
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
     // Depend on show and initialSelectedMemberIds
  }, [show, initialSelectedMemberIds]);


  // Effect for clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && show) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onCancel]);

  // Effect for pressing Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && show) {
        onCancel();
      }
    };
    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onCancel]);


  // Toggle member selection
  const toggleMemberSelection = (memberId) => {
      // Prevent deselecting the project owner
      if (memberId === currentProjectOwnerId) {
          alert("The project owner cannot be removed from the team list here.");
          return;
      }
      setSelectedMemberIds(prev =>
          prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
      );
  };

  // Handle saving - now only passes the member IDs
  const handleSave = () => {
      // Ensure the current owner is always included in the list being saved
      const membersToSave = selectedMemberIds.includes(currentProjectOwnerId)
          ? selectedMemberIds // Owner is already included
          : [...selectedMemberIds, currentProjectOwnerId]; // Add owner if not already there

      onSave(membersToSave); // Pass only the array of member IDs
  };

  // Filter members based on search query
  const filteredMembers = allTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to get member details by ID
  const getMember = (id) => allTeamMembers.find(m => m.id === id);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded shadow-lg p-6 w-[400px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Assign Team Members</h3>

        {/* Search Input */}
        <div className="mb-4">
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Member List */}
        <div className="max-h-60 overflow-y-auto border-b border-gray-200 pb-4 mb-4">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => {
              const isSelected = selectedMemberIds.includes(member.id);
              const isOwner = member.id === currentProjectOwnerId; // Check if this member is the project owner
              const displayInitials = member.initials || getInitialsFromName(member.name);

              return (
                <div
                  key={member.id}
                  // Make the div clickable to toggle selection UNLESS it's the owner
                  className={`flex items-center justify-between p-2 rounded transition-colors
                              ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'}
                              ${isOwner ? '' : 'cursor-pointer'} `} // No cursor pointer for owner
                   onClick={() => !isOwner && toggleMemberSelection(member.id)} // Only clickable if NOT owner
                >
                  <div className="flex items-center gap-3 flex-grow"> {/* flex-grow to push icon to right */}
                     {/* Display initials in a simple circle */}
                     {displayInitials && (
                        <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-800 text-xs flex items-center justify-center flex-shrink-0">
                           {displayInitials}
                        </div>
                     )}
                    <span className="text-sm text-gray-800">{member.name}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto"> {/* ml-auto pushes to the right */}
                     {isOwner && (
                         <span className="text-xs text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">Owner</span>
                     )}
                     {/* Show checkmark if selected (or if it's the owner) */}
                     {isSelected || isOwner ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-blue-600 ${isOwner ? 'opacity-50' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                     ) : (
                       // Show plus icon if not selected and not the owner
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                     )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 text-sm p-4">No members found matching your search.</div>
          )}
        </div>

        {/* Selected Members (Confirmation Display) */}
         {selectedMemberIds.length > 0 && (
             <div className="mb-4">
                 <p className="text-sm font-semibold mb-2">Selected Members:</p>
                 <div className="flex flex-wrap gap-2">
                     {/* Filter out the owner from the list of removable members */}
                     {selectedMemberIds.map(id => {
                         const member = getMember(id);
                         const isOwner = id === currentProjectOwnerId;
                         const displayInitials = member?.initials || getInitialsFromName(member?.name);

                         return member ? (
                              <div key={`selected-${id}`} className={`flex items-center border rounded-full pl-2 pr-1 py-0.5 ${isOwner ? 'border-blue-300 bg-blue-100' : 'border-gray-300 bg-gray-100'}`}>
                                  {displayInitials && (
                                      <div className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center flex-shrink-0 ${isOwner ? 'bg-blue-300 text-blue-800' : 'bg-gray-300 text-gray-800'}`}>
                                         {displayInitials}
                                      </div>
                                   )}
                                  <span className={`ml-1 text-xs ${isOwner ? 'font-semibold' : ''}`}>{member.name}</span>
                                   {isOwner ? (
                                       <span className='ml-1 text-[10px] text-blue-600 font-semibold'>Owner</span>
                                   ) : (
                                       // Allow removing if not owner
                                       <button
                                            onClick={() => toggleMemberSelection(id)}
                                            className="ml-1 text-gray-500 text-[10px] hover:text-red-500"
                                            title={`Remove ${member.name} from team`}
                                       >
                                            ✕
                                       </button>
                                   )}
                              </div>
                         ) : null;
                     })}
                 </div>
             </div>
         )}


        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>
          {/* Save button is always enabled as long as modal is open (implicitly, owner is present) */}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Save Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAssignmentModal;