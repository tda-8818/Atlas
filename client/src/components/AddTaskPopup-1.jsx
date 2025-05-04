import React, { useState, useEffect, useRef } from 'react';

// Sample team members data (you might want to fetch this from a shared source later)
const teamMembers = [
  { id: "user-1", name: "Alex Johnson", avatar: "https://i.pravatar.cc/150?img=1", initials: "AJ" },
  { id: "user-2", name: "Sarah Wilson", avatar: "https://i.pravatar.cc/150?img=2", initials: "SW" },
  { id: "user-3", name: "David Chen", avatar: "https://i.pravatar.cc/150?img=3", initials: "DC" },
  { id: "user-4", name: "Emma Rodriguez", avatar: "https://i.pravatar.cc/150?img=4", initials: "ER" },
  { id: "user-5", name: "Michael Brown", avatar: "https://i.pravatar.cc/150?img=5", initials: "MB" },
];

// Define priority levels
const priorityLevels = ['none', '!', '!!', '!!!'];

// Helper function to generate IDs (can be moved to a utility file)
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Avatar component (can be moved to a shared component file)
const Avatar = ({ user, size = "small" }) => {
  if (!user) return null;

  const sizeClass = size === "small" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";

  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClass} flex items-center justify-center`}>
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
        className={`absolute inset-0 bg-blue-500 text-white flex items-center justify-center ${user.avatar ? 'hidden' : ''}`}
        style={{ backgroundColor: stringToColor(user.name) }}
      >
        {user.initials}
      </div>
    </div>
  );
};

// Generate a color based on a string (name) (can be moved to a utility file)
const stringToColor = (str) => {
  if (!str) return '#000000';

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};


const AddTaskPopup = ({ show, onAddTask, onCancel }) => {
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [priority, setPriority] = useState('none');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  const modalRef = useRef(null);

  useEffect(() => {
    if (show) {
      setTitle('');
      setTag('');
      setDueDate('');
      setAssignedTo([]);
      setDescription('');
      setSubtasks([]);
      setPriority('none');
      setNewSubtaskTitle('');
      setShowMemberSearch(false);
      setSearchMember('');

      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          onCancel();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [show, onCancel]);

  if (!show) return null;

  const handleAddTask = () => {
    if (!title.trim()) {
      alert("Task title is required.");
      return;
    }

    const newTask = {
      id: generateId("card"),
      title: title.trim(),
      tag: tag.trim() === '' ? null : tag.trim(),
      dueDate: dueDate || null,
      assignedTo: assignedTo,
      description: description.trim(),
      subtasks: subtasks,
      priority: priority
    };

    onAddTask(newTask);
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask = {
      id: generateId("subtask"),
      title: newSubtaskTitle.trim(),
      completed: false,
      priority: 'none'
    };

    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const deleteSubtask = (subtaskId) => {
    setSubtasks(subtasks.filter(st => st.id !== subtaskId));
  };

  const toggleSubtask = (subtaskId) => {
    setSubtasks(subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleUpdateSubtaskPriority = (subtaskId, newPriority) => {
    setSubtasks(subtasks.map(st =>
      st.id === subtaskId ? { ...st, priority: newPriority } : st
    ));
  };


  const toggleUserAssignment = (userId) => {
    setAssignedTo(prevAssignedTo =>
      prevAssignedTo.includes(userId)
        ? prevAssignedTo.filter(id => id !== userId)
        : [...prevAssignedTo, userId]
    );
  };

  const getTeamMember = (userId) => {
    return teamMembers.find(member => member.id === userId);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };


  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded shadow-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Task</h2>

        {/* Task Title */}
        <div className="mb-4">
          <label htmlFor="taskTitle" className="block text-sm font-semibold mb-2">Task Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="taskTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Design landing page"
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            onKeyDown={handleTitleKeyDown}
          />
        </div>

        {/* Tag */}
        <div className="mb-4">
          <label htmlFor="taskTag" className="block text-sm font-semibold mb-2">Tag (Optional)</label>
          <input
            type="text"
            id="taskTag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g., Design, Development"
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label htmlFor="taskPriority" className="block text-sm font-semibold mb-2">Priority</label>
          <select
            id="taskPriority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {priorityLevels.map(level => (
              <option key={level} value={level}>
                {level === 'none' ? 'None' : level}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div className="mb-4">
          <label htmlFor="taskDueDate" className="block text-sm font-semibold mb-2">Due Date (Optional)</label>
          <input
            type="date"
            id="taskDueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Assigned To */}
        <div className="mb-4 relative">
          <h3 className="text-sm font-semibold mb-2">Assigned To (Optional)</h3>
          <div className="flex items-center flex-wrap gap-2">
            {assignedTo.map(userId => (
              <div key={userId} className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1">
                <Avatar user={getTeamMember(userId)} />
                <button
                  onClick={() => toggleUserAssignment(userId)}
                  className="ml-1 text-gray-400 hover:text-red-500 text-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}

            <div
              className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300"
              onClick={() => setShowMemberSearch(!showMemberSearch)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>

            {showMemberSearch && (
              <div className="absolute top-full mt-2 bg-white shadow-lg rounded p-2 border w-full max-w-xs z-10">
                <div className="mb-2">
                  <input
                    type="text"
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    placeholder="Search members..."
                    className="border rounded px-2 py-1 text-sm w-full"
                    autoFocus
                  />
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {teamMembers
                    .filter(member =>
                      member.name.toLowerCase().includes(searchMember.toLowerCase()) &&
                      !assignedTo.includes(member.id)
                    )
                    .map(member => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => {
                          toggleUserAssignment(member.id);
                          setSearchMember("");
                        }}
                      >
                        <Avatar user={member} size="small" />
                        <span className="text-sm">{member.name}</span>
                      </div>
                    ))}
                     {teamMembers.filter(member =>
                      member.name.toLowerCase().includes(searchMember.toLowerCase()) &&
                      !assignedTo.includes(member.id)
                    ).length === 0 && (
                        <div className="text-center text-sm text-gray-500">No members found</div>
                     )}
                </div>
                 <div className="mt-2 text-right">
                    <button
                        onClick={() => { setShowMemberSearch(false); setSearchMember(''); }}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        Close
                    </button>
                 </div>
              </div>
            )}
          </div>
        </div>


        {/* Description */}
        <div className="mb-4">
          <label htmlFor="taskDescription" className="block text-sm font-semibold mb-2">Description (Optional)</label>
          <textarea
            id="taskDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a detailed description..."
            className="w-full border rounded px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Subtasks Section */}
        <div className="mb-4">
           <h3 className="text-sm font-semibold mb-2">Subtasks (Optional)</h3>
           {subtasks.length > 0 && (
              <div className="space-y-2 mb-3">
                 {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center bg-gray-50 p-2 rounded">
                       <button
                         onClick={() => toggleSubtask(subtask.id)}
                         className="flex items-center justify-center w-5 h-5 mr-2 rounded border border-gray-400 focus:outline-none relative"
                         style={{ backgroundColor: subtask.completed ? '#3B82F6' : 'white' }}
                       >
                         {subtask.completed && (
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4 absolute top-0 left-0 right-0 bottom-0 m-auto pointer-events-none">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                         )}
                       </button>
                       <span className={`text-sm flex-1 mr-2 ${subtask.completed ? "line-through text-gray-400" : ""}`}>
                         {subtask.title}
                       </span>
                        <select
                           value={subtask.priority || 'none'}
                           onChange={(e) => handleUpdateSubtaskPriority(subtask.id, e.target.value)}
                           className="text-xs border rounded px-1 py-0.5 text-gray-700"
                        >
                           {priorityLevels.map(level => (
                              <option key={level} value={level}>
                                 {level === 'none' ? 'Prio' : level}
                              </option>
                           ))}
                        </select>
                       <button
                         onClick={() => deleteSubtask(subtask.id)}
                         className="ml-2 text-gray-400 hover:text-red-500 text-xs"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                         </svg>
                       </button>
                    </div>
                 ))}
              </div>
           )}

           <div className="flex items-center">
              <input
                 type="text"
                 value={newSubtaskTitle}
                 onChange={(e) => setNewSubtaskTitle(e.target.value)}
                 placeholder="Add a subtask..."
                 className="flex-1 border rounded px-3 py-2 text-sm mr-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                 onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
              />
              <button
                 onClick={addSubtask}
                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                 disabled={!newSubtaskTitle.trim()}
              >
                 Add
              </button>
           </div>
        </div>


        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!title.trim()}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskPopup;