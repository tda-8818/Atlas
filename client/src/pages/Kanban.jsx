import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddTaskPopup from '../components/AddTaskPopup';
import { useOutletContext } from "react-router-dom";
import { useAddTaskMutation, useDeleteTaskMutation, useUpdateTaskMutation } from "../redux/slices/taskSlice";
import { useCreateColumnMutation, useDeleteColumnMutation, useGetProjectColumnsQuery, useGetProjectTasksQuery, useUpdateColumnMutation } from "../redux/slices/projectSlice";
// Sample team members data
const teamMembers = [
  { id: "user-1", name: "Alex Johnson", avatar: "https://i.pravatar.cc/150?img=1", initials: "AJ" },
  { id: "user-2", name: "Sarah Wilson", avatar: "https://i.pravatar.cc/150?img=2", initials: "SW" },
  { id: "user-3", name: "David Chen", avatar: "https://i.pravatar.cc/150?img=3", initials: "DC" },
  { id: "user-4", name: "Emma Rodriguez", avatar: "https://i.pravatar.cc/150?img=4", initials: "ER" },
  { id: "user-5", name: "Michael Brown", avatar: "https://i.pravatar.cc/150?img=5", initials: "MB" },
];

// Define priority levels
const priorityLevels = ['none', '!', '!!', '!!!'];

// Define sample tags (no longer used for dropdown, but kept for reference/initial data)
const sampleTags = ['Design', 'Development', 'Marketing', 'Research', 'Bug'];

const defaultColumns = [
  {
    id: "6820365eb1d5ba37bb22848a",
    title: "Unsorted Tasks",
    cards: [
      {
        id: "card-1",
        title: "Example Task",
        tag: "Design", // Initial tag
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
        assignedTo: ["user-1"], // Changed to array for multiple assignments
        description: "This is an example task description.",
        subtasks: [
          { id: "subtask-1", title: "Research component libraries", completed: false, priority: '!' }, // Changed importance to priority
          { id: "subtask-2", title: "Sketch initial UI", completed: true, priority: '!!' }, // Changed importance to priority
        ],
        priority: '!!' // Changed importance to priority
      }
    ]
  }
];

// Generate a color based on a string (name)
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

// Avatar component with fallback to initials
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


const Kanban = () => {
  const [columns, setColumns] = useState(defaultColumns);
  const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);
  const [addTaskColumnIndex, setAddTaskColumnIndex] = useState(null);

  const [newColumnName, setNewColumnName] = useState("");
  const [selectedCard, setSelectedCard] = useState(null); // Temporary state for editing
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [editingColumnIndex, setEditingColumnIndex] = useState(null);
  const [editColumnName, setEditColumnName] = useState("");

  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  const [showDescription, setShowDescription] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  // Ref for the card detail modal content
  const cardModalRef = useRef(null);

  const { currentProject } = useOutletContext();

  /// RTK QUERY FUNCTIONS ///
  const [addTask] = useAddTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [editTask] = useUpdateTaskMutation();

  const [createColumn] = useCreateColumnMutation();
  const [updateColumn] = useUpdateColumnMutation();
  const [deleteColumn] = useDeleteColumnMutation();

  const { data: projectTasks, isLoading, isError, refetch} = useGetProjectTasksQuery(currentProject._id);
  const { data: columnData} = useGetProjectColumnsQuery(currentProject._id);
  

  // 
  const mapTasksToColumns = () => {
    if (!columnData || !projectTasks) return [];

    return columnData.map(column => ({
      id: column._id,
      title: column.title,
      cards: projectTasks
        .filter(task => task.columnId === column._id)
        .map(task => ({
          ...task,
          id: String(task._id),
        }))
    }));
  }

  // Effect to handle click outside and keydown for the card detail modal
  useEffect(() => {
    refetch();
    if (!currentProject || !projectTasks) return;

    // console.log("current Project", currentProject);
    // console.log("Got tasks in Kanban:", projectTasks);
    // console.log("Got columns from project:", columnData);
    console.log('projectTasks changed:', projectTasks);
    const formatted = mapTasksToColumns();

    //console.log("FORMATTED COLUMN OBJECTS:", formatted);
    setColumns(formatted);

    if (selectedCard) {
      const handleClickOutside = (event) => {
        // Check if the click is outside the modal content AND not within the member assignment area
        if (cardModalRef.current && !cardModalRef.current.contains(event.target) &&
          !event.target.closest('.member-assignment-area')) {
          handleCloseCardDetails(); // Close without saving
        }
      };

      const handleKeyDown = (event) => {
        // Only trigger save on Enter if the modal is open and the key is Enter
        if (event.key === 'Enter') {
          // Prevent default ONLY if we are going to handle the save action
          // This prevents adding new lines in textareas or submitting forms
          // when we intend to save the modal.

          // Check if the focused element is NOT a textarea or the new subtask input
          if (event.target.tagName !== 'TEXTAREA' && event.target.id !== 'newSubtaskInput') {
            event.preventDefault(); // Prevent default behavior for other inputs/elements
            handleSaveChanges(); // Trigger the save and close
          }
          // If the target IS a textarea or new subtask input,
          // we do NOT prevent default, allowing new lines or subtask addition.
        } else if (event.key === 'Escape') {
          handleCloseCardDetails(); // Close without saving on Escape
        }
      };


      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown); // Add keydown listener

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown); // Clean up keydown listener
      };
    }
    // Clean up listeners when modal closes
    const handleCleanupKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseCardDetails(); // Still allow escape to close if somehow stuck open
      }
    };
    document.addEventListener('keydown', handleCleanupKeyDown);
    return () => {
      document.removeEventListener('keydown', handleCleanupKeyDown);
    };


  }, [columnData, projectTasks]); // Added columns to dependencies because handleSaveChanges uses it



  // Helper function to generate IDs
  const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Column editing functions
  const startEditingColumnName = (columnIndex) => {
    if (columnIndex >= 0 && columnIndex < columns.length) {
      setEditingColumnIndex(columnIndex);
      setEditColumnName(columns[columnIndex].title);
    }
  };

  const saveColumnName = () => {
    if (editingColumnIndex !== null && editColumnName && editColumnName.trim()) {
      const updated = [...columns];
      updated[editingColumnIndex].title = editColumnName.trim();
      setColumns(updated);
      cancelEditColumnName();
    }
  };

  const cancelEditColumnName = () => {
    setEditingColumnIndex(null);
    setEditColumnName("");
  };

  const handleColumnNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveColumnName();
    } else if (e.key === 'Escape') {
      cancelEditColumnName();
    }
  };

  // Get the emergency level based on due date
  const getEmergencyLevel = (dueDate) => {
    if (!dueDate) return "none";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays === 0) return "today";
    if (diffDays <= 2) return "high";
    if (diffDays <= 5) return "medium";
    return "low";
  };

  // Get color based on emergency level
  const getEmergencyColor = (level) => {
    switch (level) {
      case "overdue": return "bg-red-500 text-white";
      default: return "";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const addColumn = async () => {
    if (!newColumnName.trim()) return;
    //const columnId = generateId("column")

    const newColumn = {
      title: newColumnName,
      index: columns.length,
    }
    console.log("Attempting to create new column: ", currentProject._id, newColumn);
    const response = await createColumn({ projectId: currentProject._id, columnData: newColumn }).unwrap();
    console.log("RESPONSE FROM CREATING A COLUMN", response);

    setColumns([
      ...columns,
      {
        id: response._id,
        title: response.title,
        cards: [],
      },
    ]);
    //console.log(columnId, typeof(columnId));
    setNewColumnName("");
  };

  const handleTaskEdit = async (cardData) => {
    try {
      console.log("Attempting to edit with new cardData:", cardData);

      const response = await editTask(cardData).unwrap();

      // Find the column and update the card's id to map to the updated Task
      const updatedColumns = columns.map((column) => {
        return {
          ...column,
          cards: column.cards.map((card) => {
            card._id === response._id ? response : card //If response is not null, use the response, otherwise use card
          })
        }
      })
      setColumns(updatedColumns);
      setSelectedCard(null);
    } catch (error) {
      console.error("Failed to edit task", error)
    }

  }


  const handleAddTaskFromPopup = async (cardData) => {

    if (!cardData.title) {
      console.warn("Missing task title!")
      return;
    }
    console.log("Prepared Task Data:", cardData);
    if (
      addTaskColumnIndex === null ||
      addTaskColumnIndex < 0 ||
      addTaskColumnIndex >= columns.length
    ) {
      console.error("Attempted to add task to invalid column index.");
      setShowAddTaskPopup(false);
      setAddTaskColumnIndex(null);
      return;
    }

    const columnId = columns[addTaskColumnIndex].id;

    console.log("Attempting to addTask to: ", columnId);
    console.log("CardData:", cardData);

    try {
      const response = await addTask({
        ...cardData,
        columnId,
        projectId: currentProject._id,
        startDate: cardData.startDate ? new Date(cardData.startDate) : undefined,
        dueDate: cardData.dueDate ? new Date(cardData.dueDate) : undefined,
      }).unwrap();

      console.log("Received response after creating task", response);

      const updated = [...columns];
      updated[addTaskColumnIndex].cards.push({
        ...response,
        id: response._id,
      });
      setColumns(updated);
    } catch (error) {
      console.error("Failed to create task:", err);
    }

    setShowAddTaskPopup(false);
    setAddTaskColumnIndex(null);
  };


  const openAddTaskPopup = (columnIndex) => {
    setAddTaskColumnIndex(columnIndex);
    setShowAddTaskPopup(true);
  };


  const confirmDeleteColumn = (columnIndex) => {
    if (columnIndex < 0 || columnIndex >= columns.length) return;

    setConfirmDelete({
      type: 'column',
      index: columnIndex
    });
  };

  const removeColumn = async () => {
    if (!confirmDelete || confirmDelete.type !== 'column') return;
    if (columns.length <= 1) return;

    const columnIndex = confirmDelete.index;
    if (columnIndex < 0 || columnIndex >= columns.length) return;

    // columnIndex is the index of the column you want to delete.  
    const columnToDelete = columns[columnIndex];
    console.log("Trying to delete column with ID:", columnToDelete.id);
    try {
      await deleteColumn({ projectId: currentProject._id, columnId: columnToDelete.id }).unwrap();

      const updated = [...columns];
      updated.splice(columnIndex, 1);
      setColumns(updated);
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting column:", error);
      // TODO: (OPTIONAL) Show a toast or error message to the user
    }

  };

  const deleteCard = async (columnIndex, cardIndex, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;


    const cardToDelete = columns[columnIndex].cards[cardIndex];
    //const columnId = columns[columnIndex].id;
    console.log("Attempting to delete:", cardToDelete._id);
    try {
      await deleteTask(
        cardToDelete._id,
      ).unwrap();

      const updated = [...columns];
      updated[columnIndex].cards.splice(cardIndex, 1);
      setColumns(updated);

      setSelectedCard(null);
      setConfirmDelete(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
      // Optionally show a toast or user message here
    }
  };

  // Handlers to update the temporary 'selectedCard' state (within the modal)
  const handleUpdateSelectedCardTitle = (title) => {
    if (selectedCard) setSelectedCard({ ...selectedCard, title });
  };

  const handleUpdateSelectedCardPriority = (priority) => {
    if (selectedCard) setSelectedCard({ ...selectedCard, priority });
  };

  const handleUpdateSelectedCardTag = (tag) => {
    if (selectedCard) setSelectedCard({ ...selectedCard, tag: tag.trim() === '' ? null : tag.trim() });
  };

  const handleUpdateSelectedCardDescription = (description) => {
    if (selectedCard) setSelectedCard({ ...selectedCard, description });
  };

  const handleUpdateSelectedCardDueDate = (dueDate) => {
    if (selectedCard) setSelectedCard({ ...selectedCard, dueDate });
  };

  // Updated to handle multiple user assignments (within Card Modal)
  const toggleUserAssignmentInCard = (userId) => {
    if (!selectedCard) return;

    const currentAssignees = selectedCard.assignedTo || [];

    const newAssignees = currentAssignees.includes(userId)
      ? currentAssignees.filter(id => id !== userId)
      : [...currentAssignees, userId];

    setSelectedCard({
      ...selectedCard,
      assignedTo: newAssignees
    });
  };


  // --- Subtask Management within Card Modal (update selectedCard state) ---

  const addSubtaskToCard = () => {
    if (!newSubtaskTitle.trim() || !selectedCard) return;

    const newSubtask = {
      id: generateId("subtask"), // Ensure draggableId exists
      title: newSubtaskTitle.trim(),
      completed: false,
      priority: "none",
    };

    setSelectedCard({
      ...selectedCard,
      subtasks: [...(selectedCard.subtasks || []), newSubtask],
    });

    setNewSubtaskTitle("");
  };
  const toggleSubtaskCompletionInCard = (subtaskId) => {
    if (!selectedCard) return;

    const subtasks = selectedCard.subtasks || [];

    const updatedSubtasks = subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    setSelectedCard({
      ...selectedCard,
      subtasks: updatedSubtasks
    });
  };

  const handleUpdateSubtaskPriorityInCard = (subtaskId, newPriority) => {
    if (!selectedCard) return;

    const subtasks = selectedCard.subtasks || [];

    const updatedSubtasks = subtasks.map(st =>
      st.id === subtaskId ? { ...st, priority: newPriority } : st
    );

    setSelectedCard({
      ...selectedCard,
      subtasks: updatedSubtasks
    });
  };


  const deleteSubtaskFromCard = (subtaskId) => {
    if (!selectedCard) return;

    const subtasks = selectedCard.subtasks || [];

    const updatedSubtasks = subtasks.filter(st => st.id !== subtaskId);

    setSelectedCard({
      ...selectedCard,
      subtasks: updatedSubtasks
    });
  };
  // --- End of Subtask Management within Card Modal ---


  // Function to save changes from the selectedCard state to the main columns state
  const handleSaveChanges = async () => {
    if (!selectedCard) {
      console.error("No card selected to save.");
      return;
    }

    // We allow saving even if the title is empty when triggered by Enter,
    // but the Save button itself remains disabled.
    // If triggered by the button and title is empty, the disabled state prevents this.
    // If triggered by Enter and title is empty, we still update the state,
    // which might lead to unexpected behavior, but fulfills the "save even if no changes"
    // and "save on enter" requirements, including when only assignment changed.
    // Consider adding a more robust check here if saving an empty title is problematic.


    const { columnIndex, cardIndex, ...cardDataToSave } = selectedCard;

    // Check if the card still exists at the original index before saving
    if (columnIndex === undefined ||
      cardIndex === undefined ||
      columnIndex < 0 ||
      columnIndex >= columns.length ||
      cardIndex < 0 ||
      cardIndex >= columns[columnIndex].cards.length ||
      columns[columnIndex].cards[cardIndex].id !== selectedCard.id
    ) {
      console.error("Card not found at original index for saving. It may have been moved or deleted.");
      // In this case, we might just close the modal without saving,
      // as the original card is no longer there.
      handleCloseCardDetails();
      return;
    }

    try {
      // Send data to backend to edit task
      const response = await editTask(cardDataToSave).unwrap();
      console.log("Task successfully updated:", response);


      const updatedColumns = [...columns];

      updatedColumns[columnIndex].cards[cardIndex] = {
        ...updatedColumns[columnIndex].cards[cardIndex],
        ...response, // Overwrite with fresh backend data
      };

      console.log("updated card", updatedColumns[columnIndex].cards[cardIndex]);

      // Set selectedCard to null AFTER the state update to close the modal
      setColumns(updatedColumns);
      setSelectedCard(null);
    } catch (error) {
      console.error("Failed to update task in Kanban.jsx", error);
    }
  };

  // Function to close the modal WITHOUT saving changes
  const handleCloseCardDetails = () => {
    // This function should strictly close the modal and discard changes.
    setSelectedCard(null);
    setShowMemberSearch(false);
    setSearchMember('');
  };

  // Find a team member by ID
  const getTeamMember = (userId) => {
    if (!userId) return null;
    return teamMembers.find(member => member.id === userId);
  };

  // Handle drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;
    const columnsCopy = [...columns];

    // If we're dragging columns
    if (type === "column") {
      const [removed] = columnsCopy.splice(source.index, 1);
      columnsCopy.splice(destination.index, 0, removed);
      setColumns(columnsCopy);
      return;
    }

    // If we're dragging subtasks (within the card modal)
    if (type === "subtask" && selectedCard) {
      // Ensure the destination droppableId matches the source droppableId for subtasks
      if (source.droppableId !== destination.droppableId) return;

      const { columnIndex, cardIndex } = selectedCard;
      // Check if the card still exists at the original index
      if (!columnsCopy[columnIndex]?.cards[cardIndex] || columnsCopy[columnIndex].cards[cardIndex].id !== selectedCard.id) {
        console.error("State mismatch during subtask drag: Card not found or id mismatch.");
        return;
      }

      const updatedCard = { ...columnsCopy[columnIndex].cards[cardIndex] };
      const subtasks = Array.from(updatedCard.subtasks || []);

      const [removed] = subtasks.splice(source.index, 1);
      subtasks.splice(destination.index, 0, removed);

      updatedCard.subtasks = subtasks;
      columnsCopy[columnIndex].cards[cardIndex] = updatedCard;

      // Important: When subtasks are reordered by D&D, update the selectedCard state immediately
      // so the modal reflects the new order.
      setSelectedCard({
        ...selectedCard,
        subtasks: [...subtasks]
      });

      setColumns(columnsCopy); // Also update the main columns state
      return;
    }


    // If the destination is the same as the source (same column)
    if (source.droppableId === destination.droppableId) {
      const columnIndex = columnsCopy.findIndex(
        col => col.id === source.droppableId
      );

      if (columnIndex < 0) return;

      const column = columnsCopy[columnIndex];
      const cards = Array.from(column.cards);
      const [removed] = cards.splice(source.index, 1);
      cards.splice(destination.index, 0, removed);

      columnsCopy[columnIndex].cards = cards;

    } else {
      // Moving from one column to another
      const sourceColumnIndex = columnsCopy.findIndex(
        col => col.id === source.droppableId
      );
      const destColumnIndex = columnsCopy.findIndex(
        col => col.id === destination.droppableId
      );

      if (sourceColumnIndex < 0 || destColumnIndex < 0) return;

      const sourceColumn = columnsCopy[sourceColumnIndex];
      const destColumn = columnsCopy[destColumnIndex];

      const sourceCards = Array.from(sourceColumn.cards);
      const destCards = Array.from(destColumn.cards);

      const [removed] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, removed);

      columnsCopy[sourceColumnIndex].cards = sourceCards;
      columnsCopy[destColumnIndex].cards = destCards;

      // If the card being moved is the one currently open in the modal,
      // update its columnIndex and cardIndex in the selectedCard state.
      if (selectedCard && selectedCard.id === removed.id) {
        // Find the new index in the destination column
        const newCardIndex = destCards.findIndex(card => card.id === removed.id);
        if (newCardIndex !== -1) {
          setSelectedCard(prev => ({
            ...prev,
            columnIndex: destColumnIndex,
            cardIndex: newCardIndex,
            colTitle: columnsCopy[destColumnIndex].title // Update column title display
          }));
        } else {
          // If for some reason the card isn't found in the destination, close the modal
          setSelectedCard(null);
        }
      }
    }

    setColumns(columnsCopy);
  };

  // When opening the card details, populate the temporary 'selectedCard' state
  const openCardDetails = (columnIndex, cardIndex) => {
    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;

    const card = columns[columnIndex].cards[cardIndex];
    setSelectedCard({
      ...card,
      columnIndex,
      cardIndex,
      colTitle: columns[columnIndex].title,
      subtasks: card.subtasks || []
    });

    setShowDescription(false);
    setShowSubtasks(false);
  };

  // Toggle section visibility functions
  const toggleDescriptionSection = () => {
    setShowDescription(!showDescription);
  };

  const toggleSubtasksSection = () => {
    setShowSubtasks(!showSubtasks);
  };

  // Multi-avatar component
  const MultiAvatar = ({ assignedUsers }) => {
    if (!assignedUsers || assignedUsers.length === 0) return null;

    const users = assignedUsers.map(id => getTeamMember(id)).filter(Boolean);
    const displayUsers = users.slice(0, 3);
    const extraCount = users.length - displayUsers.length;

    return (
      <div className="flex -space-x-2 items-center">
        {displayUsers.map((user, index) => (
          <div key={user.id} className="z-10" style={{ zIndex: 10 - index }}>
            <Avatar user={user} />
          </div>
        ))}
        {extraCount > 0 && (
          <div className="z-0 flex items-center justify-center w-6 h-6 text-xs bg-gray-200 rounded-full border-2 border-white">
            +{extraCount}
          </div>
        )}
      </div>
    );
  };


  return (
    <div>
      <Sidebar />
      <div className=" ml-[15%] w-[85%] h-[9vh] bg-[var(--background-primary)] text-[var(--text)]">
        <Navbar project={currentProject} />
      </div>
      <div className="p-4 ml-[15%] w-[85%] bg-[var(--background-primary)] text-[var(--text)] h-[91vh] overflow-y-auto">
        {/* Kanban Board (Main DragDropContext) */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-row overflow-x-auto pb-4"
                style={{
                  overflowX: 'auto',
                  paddingBottom: '16px'
                }}
              >
                {columns.map((column, columnIndex) => (
                  <Draggable
                    key={column.id}
                    draggableId={column.id}
                    index={columnIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="kanban-column bg-[var(--background)] rounded-lg shadow p-3 flex flex-col"
                        style={{
                          ...provided.draggableProps.style,
                          width: "270px",
                          minWidth: "270px",
                          marginRight: "16px",
                        }}
                      >
                        {/* Column Header */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex justify-between items-center mb-3 p-2 bg-[var(--background-secondary)] rounded-t"
                        >
                          {editingColumnIndex === columnIndex ? (
                            <div className="flex-1">
                              <input
                                value={editColumnName}
                                onChange={(e) => setEditColumnName(e.target.value)}
                                className="border rounded px-2 py-1 text-sm w-full text-gray-800"
                                autoFocus
                                onBlur={saveColumnName}
                                onKeyDown={handleColumnNameKeyDown}
                              />
                            </div>
                          ) : (
                            <h2
                              className="font-bold text-[var(--text)] text-sm uppercase cursor-pointer hover:text-blue-600"
                              onDoubleClick={() => startEditingColumnName(columnIndex)}
                            >
                              {column.title} ({column.cards.length})
                            </h2>
                          )}

                          {editingColumnIndex !== columnIndex && (
                            <button
                              onClick={()=>{ setConfirmDelete({
      type: 'column',
      index: columnIndex
    }); removeColumn();}}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              disabled={columns.length <= 1}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Cards Container */}
                        <Droppable droppableId={column.id} type="card">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex-1 p-1 rounded min-h-[150px] transition-colors ${snapshot.isDraggingOver ? "bg-blue-50" : ""
                                }`}
                            >
                              {column.cards.map((card, cardIndex) => (
                                <Draggable
                                  key={card.id}
                                  draggableId={card.id}
                                  index={cardIndex}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`kanban-card p-3 rounded shadow mb-2 flex flex-col cursor-pointer hover:shadow-md transition-shadow relative ${snapshot.isDragging ? "shadow-lg" : ""
                                        }`}
                                      onClick={() => openCardDetails(columnIndex, cardIndex)}
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                          {card.tag && (
                                            <div className="text-xs bg-blue-200 text-blue-800 rounded px-2 py-1 inline-block mb-2 self-start">
                                              {card.tag}
                                            </div>
                                          )}
                                          <div className="text-sm font-medium flex items-center">
                                            {card.title}
                                            {/* Display Priority on the card */}
                                            {card.priority && card.priority !== 'none' && (
                                              <span className="ml-1 text-xs font-bold text-gray-600">
                                                {card.priority}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {card.description && (
                                        <div className="text-xs text-gray-600 mb-2 truncate">
                                          {card.description.substring(0, 60)}
                                          {card.description.length > 60 ? "..." : ""}
                                        </div>
                                      )}

                                      <div className="flex justify-between items-center mt-auto pt-2">
                                        {/* Due Date on the left */}
                                        {card.dueDate && (
                                          <div className="flex items-center">
                                            <div className="text-xs text-gray-500">
                                              {formatDate(card.dueDate)}
                                            </div>
                                            {getEmergencyLevel(card.dueDate) === 'overdue' && (
                                              <div className="ml-1 text-xs px-1 py-0.5 rounded bg-red-500 text-white">
                                                overdue
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Assigned User Avatars on the right */}
                                        <div className="flex items-center ml-auto">
                                          <MultiAvatar assignedUsers={card.assignedTo} />
                                        </div>
                                      </div>

                                      <button
                                        onClick={(e) => deleteCard(columnIndex, cardIndex, e)}
                                        className="absolute top-1 right-1 text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {/* Button to open the AddTaskPopup */}
                        <button
                          onClick={() => openAddTaskPopup(columnIndex)}
                          className="mt-2 text-sm text-gray-500 hover:text-blue-600 w-full py-1 bg-[var(--background-secondary)] rounded"
                        >
                          + Add Task
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {/* Add Column UI */}
                <div className="add-column bg-[var(--background)] rounded-lg shadow p-3" style={{
                  width: "270px",
                  minWidth: "270px"
                }}>
                  <input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="New Column Title"
                    className="font-bold text-[var(--text)] text-sm uppercase mb-3 p-2 bg-[var(--background-secondary)] rounded-t border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={addColumn}
                    className="w-full py-1 bg-[var(--background-secondary)] rounded text-sm text-gray-700 hover:text-black"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Render the reusable AddTaskPopup */}
        <AddTaskPopup
          show={showAddTaskPopup}
          onAddTask={handleAddTaskFromPopup}
          onCancel={() => {
            setShowAddTaskPopup(false);
            setAddTaskColumnIndex(null);
          }}
        />


        {/* Card Detail Modal */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
            {/* Add ref to the modal content div */}
            {/* Removed onKeyDown from this div */}

            <div ref={cardModalRef} className="rounded shadow-lg bg-[var(--background)] p-6 w-[500px] max-h-[80vh] overflow-y-auto kanban-card-modal-content">
              {/* Title and Tag/Priority */}
              <div className="mb-4">
                <div className="flex items-center mb-1">
                  <input
                    type="text"
                    id="cardTitle"
                    value={selectedCard.title}
                    onChange={(e) => handleUpdateSelectedCardTitle(e.target.value)}
                    placeholder="Task Title"
                    className="text-xl font-bold flex-grow border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none p-1 mr-2"
                  />
                  {/* Tag and Priority on the same line */}
                  <div className="flex items-center gap-2">
                    {/* Tag Input (Editable) */}
                    <input
                      type="text"
                      id="cardTag"
                      value={selectedCard.tag || ''}
                      onChange={(e) => handleUpdateSelectedCardTag(e.target.value)}
                      placeholder="Add tag"
                      className="text-xs border rounded px-1 py-0.5 w-20 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    {/* Priority dropdown for the main card */}
                    <select
                      id="cardPriority"
                      value={selectedCard.priority || 'none'}
                      onChange={(e) => handleUpdateSelectedCardPriority(e.target.value)}
                      className="text-xs border rounded px-1 py-0.5 text-gray-700"
                    >
                      {priorityLevels.map(level => (
                        <option key={level} value={level}>
                          {level === 'none' ? 'Priority' : level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-500">in list {selectedCard.colTitle}</p>
              </div>


              {/* Due Date and Assignment */}
              <div className="mb-4 flex items-start justify-between">
                <div className="w-1/2">
                  <h3 className="text-sm font-semibold mb-2">Due Date</h3>
                  <div className="flex items-center">
                    <input
                      type="date"
                      id="cardDueDate"
                      value={selectedCard.dueDate ? selectedCard.dueDate.split('T')[0] : ""}
                      onChange={(e) => handleUpdateSelectedCardDueDate(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    {selectedCard.dueDate && getEmergencyLevel(selectedCard.dueDate) === 'overdue' && (
                      <div className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500 text-white">
                        overdue
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Section - Multiple with search */}
                {/* Added class for click-outside handler exclusion */}
                <div className="w-1/2 member-assignment-area">
                  <h3 className="text-sm font-semibold mb-2">Assigned To</h3>
                  <div className="flex items-center flex-wrap gap-2 relative">
                    {/* Display assigned members */}
                    {(selectedCard.assignedTo || []).map(userId => (
                      <div key={userId} className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1">
                        <Avatar user={getTeamMember(userId)} />
                        <button
                          onClick={() => toggleUserAssignmentInCard(userId)}
                          className="ml-1 text-gray-400 hover:text-red-500 text-xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* Add member button */}
                    <div
                      className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300"
                      onClick={() => setShowMemberSearch(!showMemberSearch)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {/* Member search panel */}
                    {showMemberSearch && (
                      <div className="absolute top-full mt-2 shadow-lg rounded p-2 border w-full max-w-xs z-10">
                        <div className="mb-2">
                          <input
                            type="text"
                            id="memberSearchInput" // Added ID for keydown check
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
                              !(selectedCard.assignedTo || []).includes(member.id)
                            )
                            .map(member => (
                              <div
                                key={member.id}
                                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
                                onClick={() => {
                                  toggleUserAssignmentInCard(member.id);
                                  setSearchMember(""); // Clear search after selection
                                  setShowMemberSearch(false); // Close search after selection
                                }}
                              >
                                <Avatar user={member} size="small" />
                                <span className="text-sm">{member.name}</span>
                              </div>
                            ))}
                          {teamMembers.filter(member =>
                            member.name.toLowerCase().includes(searchMember.toLowerCase()) &&
                            !(selectedCard.assignedTo || []).includes(member.id)
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
              </div>

              {/* Description Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">Description</h3>
                  <button
                    onClick={toggleDescriptionSection}
                    className="text-gray-500 hover:text-gray-700 text-xs"
                  >
                    {showDescription ? 'Collapse' : 'Expand'}
                  </button>
                </div>
                {showDescription && (
                  <textarea
                    value={selectedCard.description || ""}
                    onChange={(e) => handleUpdateSelectedCardDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="w-full border rounded p-2 text-sm min-h-[80px]"
                    id="cardDescription"
                  />
                )}
              </div>

              {/* Subtasks Section (within Card Modal) */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">Subtasks ({selectedCard.subtasks?.filter(st => st.completed).length || 0}/{selectedCard.subtasks?.length || 0})</h3>
                  <button
                    onClick={toggleSubtasksSection}
                    className="text-gray-500 hover:text-gray-700 text-xs"
                  >
                    {showSubtasks ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {/* Conditional rendering for subtasks */}
                {showSubtasks && (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={`subtasks-${selectedCard.id}`} type="subtask">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 mb-3"
                        >
                          {(selectedCard.subtasks || []).map((subtask, index) => (
                            <Draggable key={subtask.id} draggableId={subtask.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center bg-gray-50 p-2 rounded group cursor-grab ${snapshot.isDragging ? 'shadow-md bg-gray-100' : ''}`}
                                >
                                  <button
                                    onClick={() => toggleSubtaskCompletionInCard(subtask.id)}
                                    className="flex items-center justify-center w-5 h-5 mr-2 rounded border border-gray-400 focus:outline-none relative"
                                    style={{ backgroundColor: subtask.completed ? '#3B82F6' : 'white' }}
                                  >
                                    {subtask.completed && (
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4 absolute top-0 left-0 right-0 bottom-0 m-auto pointer-events-none">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </button>

                                  <span
                                    onClick={() => toggleSubtaskCompletionInCard(subtask.id)}
                                    className={`text-sm flex-1 cursor-pointer mr-1 ${subtask.completed ? "line-through text-gray-400" : ""}`}
                                  >
                                    {subtask.title}
                                  </span>

                                  <select
                                    value={subtask.priority || 'none'}
                                    onChange={(e) => handleUpdateSubtaskPriorityInCard(subtask.id, e.target.value)}
                                    className="text-xs border rounded px-1 py-0.5 text-gray-700"
                                  >
                                    {priorityLevels.map(level => (
                                      <option key={level} value={level}>
                                        {level === 'none' ? 'Prio' : level}
                                      </option>
                                    ))}
                                  </select>


                                  <button
                                    onClick={() => deleteSubtaskFromCard(subtask.id)}
                                    className="ml-2 text-gray-400 hover:text-red-500 text-xs"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
                {/* Input for adding new subtask */}
                {showSubtasks && (
                  <div className="flex items-center mt-3">
                    <input
                      type="text"
                      id="newSubtaskInput"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add a subtask..."
                      className="flex-1 border rounded px-2 py-1 text-sm mr-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtaskToCard(); } }}
                    />
                    <button
                      onClick={addSubtaskToCard}
                      className="px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 text-white hover:bg-blue-600" // Added blue background and white text
                      disabled={!newSubtaskTitle.trim()}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-between items-center">
                {/* Delete Button (Left) */}
                <button
                  onClick={() => {
                    const { columnIndex, cardIndex } = selectedCard;
                    setConfirmDelete({
                      type: 'card',
                      columnIndex: columnIndex,
                      cardIndex: cardIndex
                    });
                    setSelectedCard(null);
                  }}
                  className="px-4 py-2 text-red-500 hover:text-red-700 rounded text-sm"
                >
                  Delete
                </button>

                {/* Right Buttons (Close and Save) */}
                <div className="flex">
                  {/* Close Button (Left of Save) */}
                  <button
                    onClick={handleCloseCardDetails}
                    className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm mr-2"
                  >
                    Close
                  </button>
                  {/* Save Button (Right) */}
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedCard.title.trim()} // Still disable button if title is empty
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integration with DeleteTaskPopup for card deletion */}
        {confirmDelete && confirmDelete.type === 'card' && (
          <DeleteTaskPopup
            toggle={true}
            onSubmit={() => {
              const { columnIndex, cardIndex } = confirmDelete;
              deleteCard(columnIndex, cardIndex, { stopPropagation: () => { } });
              setConfirmDelete(null);
            }}
            onClose={() => setConfirmDelete(null)}
          />
        )}

        {/* Confirm Delete Column Modal */}
        {confirmDelete && confirmDelete.type === 'column' && (
          <DeleteTaskPopup
            toggle={true}
            onSubmit={removeColumn}
            onClose={() => setConfirmDelete(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Kanban;