// AddTaskPopup-1.jsx
import React, { useState, useEffect, useRef, use } from 'react';

// Sample team members data (you might want to fetch this from a shared source later)
// This data is duplicated here and in Gantt.jsx - ideally, it should be in a shared context or store.
const teamMembers = [
  { id: "user-1", name: "Alex Johnson", avatar: "https://i.pravatar.cc/150?img=1", initials: "AJ" },
  { id: "user-2", name: "Sarah Wilson", avatar: "https://i.pravatar.cc/150?img=3", initials: "SW" },
  { id: "user-3", name: "David Chen", avatar: "https://i.pravatar.cc/150?img=5", initials: "DC" },
  { id: "user-4", name: "Emma Rodriguez", avatar: "https://i.pravatar.cc/150?img=7", initials: "ER" },
  { id: "user-5", name: "Michael Brown", avatar: "https://i.pravatar.cc/150?img=9", initials: "MB" },
];

// Define priority levels
const priorityLevels = ['', '!', '!!', '!!!'];

// Helper function to generate IDs (can be moved to a utility file)
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Avatar component (can be moved to a shared component file)
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


const AddTaskPopup = ({ show, onAddTask, onCancel,onDelete, onEdit, teamMembers = [], initialValues = null }) => {
  const [title, setTitle] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [startDate, setStartDate] = useState(''); // Renamed from dueDate
  const [dueDate, setDueDate] = useState(''); // New state for end date
  const [assignedTo, setAssignedTo] = useState([]);
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [priority, setPriority] = useState('none');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  // State for collapsible sections
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true);
  const [isSubtasksCollapsed, setIsSubtasksCollapsed] = useState(true);


  // Track if we're in edit mode
  const [isEditing, setIsEditing] = useState(false);

  const modalRef = useRef(null);
  const memberSearchRef = useRef(null); // Ref for member search dropdown
  const titleInputRef = useRef(null); // Ref for the title input

  // Handler to populate form with initialValues when editing an existing task
  useEffect(() => {
    if (show) {
      console.log("current initial value: ",initialValues)
      if (initialValues) {
        // We're editing an existing task
        setTitle(initialValues.title || '');
        setIsCompleted(initialValues.status);
        // Populate start and due dates from initialValues (these are strings from state)
        setStartDate(formatDateToInputValue(initialValues.startDate) || '');
        setDueDate(formatDateToInputValue(initialValues.dueDate) || '');
        setAssignedTo(initialValues.assignedTo || []);
        setDescription(initialValues.description || '');
        setSubtasks(initialValues.subtasks || []);
        setPriority(initialValues.priority || 'none');
        setIsEditing(true);
        // If description or subtasks have content, expand those sections by default when editing
        setIsDescriptionCollapsed(!initialValues.description);
        setIsSubtasksCollapsed(!initialValues.subtasks?.length);

      } else {
        // We're creating a new task
        setTitle('');
        setIsCompleted(false);
        setStartDate('');
        setDueDate('');
        setAssignedTo([]);
        setDescription('');
        setSubtasks([]);
        setPriority('none');
        setIsEditing(false);
        // Collapse sections by default when adding
        setIsDescriptionCollapsed(true);
        setIsSubtasksCollapsed(true);
      }

      setNewSubtaskTitle('');
      setShowMemberSearch(false);
      setSearchMember('');

      // Auto-focus the title input when the modal opens
      requestAnimationFrame(() => {
          if (titleInputRef.current) {
              titleInputRef.current.focus();
          }
      });

    }
  }, [show, initialValues]); // Added initialValues to dependencies

  function formatDateToInputValue(date) {
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

    // Effect to handle clicking outside the member search dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (memberSearchRef.current && !memberSearchRef.current.contains(event.target)) {
                // Check if the click target is the add member button itself
                 const addMemberButton = modalRef.current?.querySelector('.w-6.h-6.bg-gray-200');
                 if (addMemberButton && addMemberButton.contains(event.target)) {
                     // Do nothing if clicking the button that opens the search
                     return;
                 }
                setShowMemberSearch(false);
                setSearchMember('');
            }
        };

        if (showMemberSearch) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMemberSearch]); // Re-run effect when showMemberSearch changes


  if (!show) return null;

  const handleSave = () => {
    // Basic validation - title is required for new tasks
    if (!title.trim() && !isEditing) {
        alert("Task title is required.");
        return;
    }

    // The duration calculation logic is now primarily handled in the parent (Gantt.jsx)
    // based on the startDate and dueDate strings provided by the popup.
    // We still pass these strings back to the parent.
    // The parent will convert them to Date objects and calculate the duration for Gantt.
    console.log("initial values: ",initialValues);
    const taskData = {
      id: initialValues?.id, // Pass the ID if editing
      title: title.trim(),
      status: isCompleted,
      startDate: startDate || null, // Pass start date string from popup
      dueDate: dueDate || null, // Pass due date string from popup
      // Duration is calculated by the parent component before updating Gantt
      assignedTo: assignedTo,
      description: description.trim(),
      subtasks: subtasks, // Include subtasks
      priority: priority
    };

    onAddTask(taskData); // Call the parent's save handler (renamed from onAddTask to be more general)
  };
  const handleEdit = () =>{
    const taskData = {
      id: initialValues?.id, // Pass the ID if editing
      title: title.trim(),
      status: isCompleted,
      startDate: startDate || null, // Pass start date string from popup
      dueDate: dueDate || null, // Pass due date string from popup
      // Duration is calculated by the parent component before updating Gantt
      assignedTo: assignedTo,
      description: description.trim(),
      subtasks: subtasks, // Include subtasks
      priority: priority
    };
    onEdit(taskData);
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask = {
      id: generateId("subtask"),
      title: newSubtaskTitle.trim(),
      completed: false,
      priority: 'none' // Default priority for subtask
    };

    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
     // Ensure subtasks section is expanded when a new subtask is added
    setIsSubtasksCollapsed(false);
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


const toggleUserAssignment = (member) => {
  setAssignedTo(prev =>
    prev.some(m => m._id === member._id)
      ? prev.filter(m => m._id !== member._id)
      : [...prev, member]
  );
};


   // Key down handler for the entire modal content
   const handleModalKeyDown = (e) => {
        // Prevent saving on Enter if member search is open and focused
        if (showMemberSearch && memberSearchRef.current?.contains(e.target)) {
            return;
        }
        // Prevent saving on Enter if the new subtask input is focused (Enter adds subtask)
        if (e.target.id === 'newSubtaskInput') {
            return;
        }
        // Prevent saving on Enter if a textarea is focused
        if (e.target.tagName === 'TEXTAREA') {
             return;
        }

        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default (e.g., form submission)
            handleSave(); // Trigger save
        } else if (e.key === 'Escape') {
            onCancel(); // Close on Escape
        }
   };

  //  const handleTaskDelete = () =>{
  //     onDelete();
  //     onCancel();
  //  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
      {/* Add onKeyDown listener to the modal content div */}
      <div ref={modalRef} className="bg-[var(--background)] rounded shadow-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto" onKeyDown={handleModalKeyDown}>

        {/* Top row: Task Title, Tag, Priority */}
        <div className="flex items-center gap-3 mb-4">
           {/* Task Title Input (takes up available space) */}
           <div className="flex-grow"> {/* Allow title to grow */}
               <input
                 type="text"
                 ref={titleInputRef} // Attach the ref
                 id="taskTitle"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 placeholder="Task Title"
                 className="w-full text-[var(--text)] text-lg font-semibold focus:outline-none border-b border-gray-300 focus:border-blue-500 pb-1" // Styled as a line
               />
               {/* Optional: Add a subtle indicator if title is required when adding */}
               {!isEditing && !title.trim() && (
                   <p className="text-red-500 text-xs mt-1">Task title is required</p>
               )}
           </div>

           {/* Tag - Removed label */}
           {/* Use flex-shrink-0 and a smaller basis to keep it compact */}
          {/* Task Completion */}
  <div className="flex flex-col items-center space-y-3">
    <span className="text-sm font-medium text-gray-700">Completed</span>
    <input
      type="checkbox"
      id="completed"
      checked={isCompleted}
      onChange={(e) => setIsCompleted(e.target.checked)}
      className="w-6 h-6"
    />
  </div>


           {/* Priority - Removed label */}
           {/* Use flex-shrink-0 and a smaller basis to keep it compact */}
           <div className="flex-shrink-0 basis-[60px]">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Priority</h3>

               <select
                 id="taskPriority"
                 value={priority}
                 onChange={(e) => setPriority(e.target.value)}
                 className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               >
                 {priorityLevels.map(level => (
                   <option key={level} value={level}>
                     {level === 'none' ? 'None' : level}
                   </option>
                 ))}
               </select>
           </div>
        </div>


        {/* Second row: Start Date, Due Date, Assigned To */}
        <div className="mb-4">
            <div className="flex flex-wrap items-center gap-3">
                 {/* Start Date */}
                 <div className="flex-grow flex-shrink-0 basis-[100px]">
                     <label htmlFor="taskStartDate" className="block text-sm font-semibold mb-1 text-[var(--text)]">Start Date</label>
                     <input
                         type="date"
                         id="taskStartDate"
                         value={startDate || ''}
                         onChange={(e) => setStartDate(e.target.value)}
                         className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                 </div>
                  {/* Due Date */}
                 <div className="flex-grow flex-shrink-0 basis-[100px]">
                     <label htmlFor="taskDueDate" className="block text-sm font-semibold mb-1 text-[var(--text)]">Due Date</label>
                     <input
                         type="date"
                         id="taskDueDate"
                         value={dueDate || ''}
                         onChange={(e) => setDueDate(e.target.value)}
                         className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                 </div>
                 {/* Assigned To */}
                 <div className="flex-grow basis-[120px] relative">
                   <h3 className="text-sm font-semibold text-[var(--text)] mb-2">Assigned To</h3>
                   <div className="flex items-center flex-wrap gap-1">
                    {(assignedTo || []).map((user) => (
  <div key={user._id} className="flex items-center bg-gray-100 rounded-full border border-gray-200 p-0.5 pr-1">
    {/* <Avatar user={user} size="small" /> */}
    <span className='text-sm m-auto'>{user.firstName}</span>
    <button
      onClick={() => toggleUserAssignment(user)}
      className="ml-0.5 text-gray-400 hover:text-red-500 text-xs"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
))}


                     <div
                       className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 flex-shrink-0"
                       onClick={() => setShowMemberSearch(!showMemberSearch)}
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                       </svg>
                     </div>

                     {showMemberSearch && (
                       <div ref={memberSearchRef} className="absolute top-full mt-2 bg-white shadow-lg rounded p-2 border w-full max-w-xs z-10">
                         <div className="mb-2">
                           <input
                             type="text"
                             value={searchMember}
                             onChange={(e) => setSearchMember(e.target.value)}
                             placeholder="Search members..."
                             className="border rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                             autoFocus
                           />
                         </div>
                         <div className="max-h-40 overflow-y-auto">
                           {teamMembers
                             .filter(member =>
                               member.firstName.toLowerCase().includes(searchMember.toLowerCase()) &&
                               !assignedTo.some(m => m._id === member._id)

                             )
                             .map(member => (
                               <div
                                 key={member._id}
                                 className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
                                 onClick={() => {
                                   toggleUserAssignment(member);
                                   setSearchMember("");
                                   setShowMemberSearch(false);
                                 }}
                               >
                                 <span className="text-sm">{member.firstName} {member.lastName}</span>
                               </div>
                             ))}
                           {teamMembers.filter(member =>
                             member.firstName.toLowerCase().includes(searchMember.toLowerCase()) &&
                            !assignedTo.some(m => m._id === member._id)

                           ).length === 0 && (
                             <div className="text-center text-sm text-[var(--text)]">No members found</div>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
            </div>
        </div>


        {/* Description Section (Collapsible) */}
        <div className="mb-4">
           <button
               className="flex items-center justify-between w-full py-3 text-sm font-semibold text-left text-[var(--text)] hover:text-[var(--text-muted)] focus:outline-none" // Removed border-b
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
                 className="w-full border rounded px-3 py-2 text-[var(--text)] text-sm min-h-[80px] focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               />
           </div>
        </div>


        {/* Subtasks Section (Collapsible) */}
        <div className="mb-4">
           <button
               className="flex items-center justify-between w-full py-3 text-sm font-semibold text-left text-[var(--text)] hover:text-[var(--text-muted)] focus:outline-none" // Removed border-b
               onClick={() => setIsSubtasksCollapsed(!isSubtasksCollapsed)}
           >
               Subtasks (Optional)
               <svg
                   className={`w-4 h-4 transform transition-transform duration-200 ${isSubtasksCollapsed ? '' : 'rotate-180'}`}
                   xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 20 20"
                   fill="currentColor"
               >
                   <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
           </button>
           <div className={`pb-3 ${isSubtasksCollapsed ? 'hidden' : ''}`}>
                {(subtasks || []).length > 0 && (
                   <div className="space-y-2 mb-3">
                     {(subtasks || []).map((subtask) => (
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
                     id="newSubtaskInput"
                     value={newSubtaskTitle}
                     onChange={(e) => setNewSubtaskTitle(e.target.value)}
                     placeholder="Add a subtask..."
                     className="flex-1 border rounded px-3 text-[var(--text)] py-2 text-sm mr-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                   />
                   <button
                     onClick={addSubtask}
                     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={!newSubtaskTitle.trim()}
                   >
                     Add
                   </button>
                 </div>
           </div>
        </div>


        {/* Buttons */}
        <div className="flex justify-between items-center gap-2 mt-6">
  {/* Left side: Delete button (conditionally rendered) */}
  {isEditing ? (
    <button
      className="text-red-500 hover:text-red-300 mt-1 cursor-pointer"
      onClick={()=>{
        onDelete();
      }}
    >
      Delete
    </button>
  ) : (
    <div /> // Empty div to keep spacing consistent when Delete is hidden
  )}

  {/* Right side: Cancel and Save/Add buttons */}
  {isEditing? (
<div className="flex justify-end gap-2">
    <button
      onClick={onCancel}
      className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm"
    >
      Cancel
    </button>
    <button
      onClick={handleEdit}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!title.trim() && !isEditing}
    >
      {isEditing ? 'Save Changes' : 'Add Task'}
    </button>
  </div>


  ):(
<div className="flex justify-end gap-2">
    <button
      onClick={onCancel}
      className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm"
    >
      Cancel
    </button>
    <button
      onClick={handleSave}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!title.trim() && !isEditing}
    >
      {isEditing ? 'Save Changes' : 'Add Task'}
    </button>
  </div>
  )}
  
</div>

      </div>
    </div>
  );
};

export default AddTaskPopup;