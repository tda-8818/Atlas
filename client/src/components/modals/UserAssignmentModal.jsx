// src/components/UserAssignmentModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@headlessui/react';
//import { useUpdateProjectUsers,  } from '../redux/slices/projectSlice'
// import { useOnClickOutside } from './hooks/useOnClickOutside';
// import { useEscapeKey } from './hooks/useEscapeKey';

// Receive currentProjectOwnerId to prevent removing the owner from the list
const UserAssignmentModal = ({ show, onSave, onCancel }) => {
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
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Team Members</h3>

        {/* Search Input */}
        {/* <div className="mb-4">
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div> */}

        {/* Member List */}
        <div className="max-h-60 overflow-y-auto border-b border-gray-200 pb-4 mb-4">
          
        </div>

        


        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 text-sm"
          >
            Cancel
          </Button>
          {/* Save button is always enabled as long as modal is open (implicitly, owner is present) */}
          <Button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserAssignmentModal;