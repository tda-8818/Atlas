import React, { useState, useEffect, useRef } from 'react';

const Avatar = ({ user, size = "small" }) => {
  if (!user) return null;
  const sizeClass = size === "small" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClass} flex items-center justify-center flex-shrink-0`}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={`absolute inset-0 text-white flex items-center justify-center ${user.avatar ? 'hidden' : ''}`}
        style={{ backgroundColor: stringToColor(user.name) }}
      >
        {user.initials}
      </div>
    </div>
  );
};

const stringToColor = (str) => {
  if (!str) return '#000000';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const teamMembers = [
  { id: "user-1", name: "Alex Johnson", avatar: "/avatars/avatar1.png", initials: "AJ" },
  { id: "user-2", name: "Sarah Wilson", avatar: "/avatars/avatar2.png", initials: "SW" },
  { id: "user-3", name: "David Chen", avatar: "/avatars/avatar3.png", initials: "DC" },
  { id: "user-4", name: "Emma Rodriguez", avatar: "/avatars/avatar4.png", initials: "ER" },
  { id: "user-5", name: "Michael Brown", avatar: "/avatars/avatar5.png", initials: "MB" },
];

const AddProjectModal = ({ show, onAddProject, onCancel, initialValues = null }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [owner, setOwner] = useState(null);
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState([]);
  const [description,setDescription] = useState('');

  const [showOwnerSearch, setShowOwnerSearch] = useState(false);
  const [showTeamMemberSearch, setShowTeamMemberSearch] = useState(false);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [isDescriptionCollapsed,setIsDescriptionCollapsed] = useState();

  const modalRef = useRef(null);
  const dropdownRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (show) {
      if (initialValues) {
        setTitle(initialValues.title || '');
        setStartDate(initialValues.startDate || '');
        setDueDate(initialValues.dueDate || '');
        setOwner(initialValues.owner || null);
        setSelectedTeamMemberIds(initialValues.teamMembers || []);
      } else {
        setTitle('');
        setStartDate('');
        setDueDate('');
        setOwner(null);
        setSelectedTeamMemberIds([]);
      }
      setShowOwnerSearch(false);
      setShowTeamMemberSearch(false);
      setOwnerSearchQuery('');
      setTeamSearchQuery('');
      requestAnimationFrame(() => titleInputRef.current?.focus());
    }
  }, [show, initialValues]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onCancel(); // close on outside click
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
      const isSearchActive = showOwnerSearch || showTeamMemberSearch;

      if (e.key === 'Enter' && !isSearchActive && isTyping && title.trim()) {
        e.preventDefault();
        handleSave();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, title, showOwnerSearch, showTeamMemberSearch]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Project title is required.");
      return;
    }
    const projectData = {
      id: initialValues?.id,
      title: title.trim(),
      startDate: startDate || null,
      dueDate: dueDate || null,
      owner,
      description: description,
      teamMembers: selectedTeamMemberIds,
      progress: initialValues?.progress || 0,
      daysLeft: dueDate
        ? Math.max(Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)), 0)
        : 0,
    };
    console.log("new project data ",projectData)
    onAddProject(projectData);
  };

  const toggleTeamMember = (id) => {
    setSelectedTeamMemberIds(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const getMember = (id) => teamMembers.find(m => m.id === id);

  const filteredMembers = (query, excludeIds = []) =>
    teamMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(query.toLowerCase()) &&
        !excludeIds.includes(m.id)
    );

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded shadow-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto"
      >
        {/* Title */}
        <div className="mb-4">
          <input
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Title"
            className="w-full text-lg font-semibold border-b border-gray-300 focus:border-blue-500 focus:outline-none pb-1"
          />
        </div>

        {/* Dates */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold block mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold block mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm" />
          </div>
        </div>

        {/* Owner */}
        <div className="mb-4">
           <button
               className="flex items-center justify-between w-full py-3 text-sm font-semibold text-left text-gray-700 hover:text-gray-900 focus:outline-none" // Removed border-b
               onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
           >
               Description (Optional)
               <svg
                   className={`w-4 h-4 transform transition-transform duration-200 ${isDescriptionCollapsed ? '' : 'rotate-180'}`}
                   xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 20 20"
                   fill="currentColor"
               >
                   <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
           </button>
           <div className={`pb-3 ${isDescriptionCollapsed ? 'hidden' : ''}`}>
               <textarea
                 id="taskDescription"
                 value={description || ''}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder="Add a detailed description..."
                 className="w-full border rounded px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               />
           </div>
        </div>
        {/* <div className="mb-4 relative">
          <label className="text-sm font-semibold block mb-1">Project Owner</label>
          <div className="flex items-center gap-2 flex-wrap">
            {owner ? (
              <div className="flex items-center border border-gray-300 bg-gray-100 rounded-full px-2 py-1">
                <Avatar user={getMember(owner)} />
                <span className="ml-2 text-sm">{getMember(owner)?.name}</span>
                <button onClick={() => setOwner(null)} className="ml-2 text-gray-500 text-xs hover:text-red-500">✕</button>
              </div>
            ) : (
              <button
                className="add-member-btn w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                onClick={() => {
                  setShowOwnerSearch(!showOwnerSearch);
                  setShowTeamMemberSearch(false);
                }}
              >＋</button>
            )}
          </div>
          {showOwnerSearch && !owner && (
            <div ref={dropdownRef} className="absolute z-10 mt-2 bg-white border rounded shadow p-2 w-full">
              <input
                value={ownerSearchQuery}
                onChange={(e) => setOwnerSearchQuery(e.target.value)}
                placeholder="Search owner..."
                className="w-full border px-2 py-1 text-sm rounded mb-2"
              />
              <div className="max-h-40 overflow-y-auto">
                {filteredMembers(ownerSearchQuery, [...selectedTeamMemberIds]).map((m) => (
                  <div key={m.id} className="flex items-center gap-2 p-1 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setOwner(m.id);
                      setShowOwnerSearch(false);
                      setOwnerSearchQuery('');
                    }}>
                    <Avatar user={m} />
                    <span>{m.name}</span>
                  </div>
                ))}
              </div>
              <div className="text-right mt-2">
                <button
                  onClick={() => {
                    setShowOwnerSearch(false);
                    setOwnerSearchQuery('');
                  }}
                  className="text-blue-500 text-sm hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div> */}

        {/* Team Members */}
        <div className="mb-4 relative">
          <label className="text-sm font-semibold block mb-1">Team Members</label>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedTeamMemberIds.map((id) => {
              const member = getMember(id);
              return (
                <div key={id} className="flex items-center border border-gray-300 bg-gray-100 rounded-full px-2 py-1">
                  <Avatar user={member} />
                  <button onClick={() => toggleTeamMember(id)} className="ml-1 text-gray-500 text-xs hover:text-red-500">✕</button>
                </div>
              );
            })}
            <button
              className="add-member-btn w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              onClick={() => {
                setShowTeamMemberSearch(!showTeamMemberSearch);
                setShowOwnerSearch(false);
              }}
            >＋</button>
          </div>
          {showTeamMemberSearch && (
            <div ref={dropdownRef} className="absolute z-10 mt-2 bg-white border rounded shadow p-2 w-full">
              <input
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full border px-2 py-1 text-sm rounded mb-2"
              />
              <div className="max-h-40 overflow-y-auto">
                {filteredMembers(teamSearchQuery, [...selectedTeamMemberIds, owner]).map((m) => (
                  <div key={m.id} className="flex items-center gap-2 p-1 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      toggleTeamMember(m.id);
                      setTeamSearchQuery('');
                    }}>
                    <Avatar user={m} />
                    <span>{m.name}</span>
                  </div>
                ))}
              </div>
              <div className="text-right mt-2">
                <button
                  onClick={() => {
                    setShowTeamMemberSearch(false);
                    setTeamSearchQuery('');
                  }}
                  className="text-blue-500 text-sm hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50"
          >
            {initialValues ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
