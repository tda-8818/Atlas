import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import ProjectHeader from "../components/ProjectHeader";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DeleteTaskPopup from '../components/DeleteTaskPopup';
import AddTaskPopup from '../components/AddTaskPopup-1';

// Sample team members data
const teamMembers = [
  { id: "user-1", name: "Alex Johnson", avatar: "https://i.pravatar.cc/150?img=1", initials: "AJ" },
  { id: "user-2", name: "Sarah Wilson", avatar: "https://i.pravatar.cc/150?img=2", initials: "SW" },
  { id: "user-3", name: "David Chen", avatar: "https://i.pravatar.cc/150?img=3", initials: "DC" },
  { id: "user-4", name: "Emma Rodriguez", avatar: "https://i.pravatar.cc/150?img=4", initials: "ER" },
  { id: "user-5", name: "Michael Brown", avatar: "https://i.pravatar.cc/150?img=5", initials: "MB" },
];

const defaultColumns = [
  {
    id: "column-1",
    title: "Tasks",
    cards: [
      {
        id: "card-1",
        title: "Example Task",
        tag: "Design",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
        assignedTo: ["user-1"], // Changed to array for multiple assignments
        description: "This is an example task description.",
        subtasks: [
          { id: "subtask-1", title: "Research component libraries", completed: false },
          { id: "subtask-2", title: "Sketch initial UI", completed: true },
        ]
      }
    ]
  }
];

const Kanban = () => {
  const [columns, setColumns] = useState(defaultColumns);
  const [showCardInput, setShowCardInput] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Add states for column editing
  const [editingColumnIndex, setEditingColumnIndex] = useState(null);
  const [editColumnName, setEditColumnName] = useState("");

  // Add these missing state variables
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  // State for controlling collapsed sections in the card modal
  // Set initial state to false so they are hidden by default
  const [showDescription, setShowDescription] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

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
    today.setHours(0, 0, 0, 0); // Set to start of day for proper comparison

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0); // Set to start of day for proper comparison

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

  const addColumn = () => {
    if (!newColumnName.trim()) return;
    setColumns([
      ...columns,
      {
        id: generateId("column"),
        title: newColumnName,
        cards: []
      }
    ]);
    setNewColumnName("");
  };

  const addCard = (columnIndex, cardData) => {
    if (columnIndex < 0 || columnIndex >= columns.length) return;

    const updated = [...columns];
    updated[columnIndex].cards.push({
      id: generateId("card"),
      title: cardData.title,
      tag: cardData.tag,
      dueDate: cardData.dueDate || null,
      assignedTo: cardData.assignedTo || [], // Empty array for multiple assignments
      description: cardData.description || "",
      subtasks: cardData.subtasks || []
    });
    setColumns(updated);
    setShowCardInput(null);
  };

  const confirmDeleteColumn = (columnIndex) => {
    if (columnIndex < 0 || columnIndex >= columns.length) return;

    setConfirmDelete({
      type: 'column',
      index: columnIndex
    });
  };

  const deleteColumn = () => {
    if (!confirmDelete || confirmDelete.type !== 'column') return;
    if (columns.length <= 1) return; // Prevent deleting if it's the only column

    const columnIndex = confirmDelete.index;
    if (columnIndex < 0 || columnIndex >= columns.length) return;

    const updated = [...columns];
    updated.splice(columnIndex, 1);
    setColumns(updated);
    setConfirmDelete(null);
  };

  const deleteCard = (columnIndex, cardIndex, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;

    const updated = [...columns];
    updated[columnIndex].cards.splice(cardIndex, 1);
    setColumns(updated);

    // Close any open modals
    setSelectedCard(null);
    setConfirmDelete(null);
  };

  const handleUpdateCardTitle = (title) => {
    if (!selectedCard) return;

    const { columnIndex, cardIndex } = selectedCard;
    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;

    const updated = [...columns];
    updated[columnIndex].cards[cardIndex].title = title;
    setColumns(updated);

    // Update the selected card to reflect changes
    setSelectedCard({
      ...selectedCard,
      title
    });
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim() || !selectedCard) return;

    const { columnIndex, cardIndex } = selectedCard;
    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;

    const updated = [...columns];

    // Create a new subtask object
    const newSubtask = {
      id: generateId("subtask"),
      title: newSubtaskTitle,
      completed: false
    };

    // Add it to the data
    updated[columnIndex].cards[cardIndex].subtasks.push(newSubtask);

    // Update the columns state
    setColumns(updated);

    // Get the updated card with the new subtask array directly from the updated state
    const updatedCard = updated[columnIndex].cards[cardIndex];

    // Update the selected card with the same subtasks array from the updated state
    setSelectedCard({
      ...selectedCard,
      subtasks: [...updatedCard.subtasks]
    });

    // Clear the input field
    setNewSubtaskTitle("");
  };

  const toggleSubtask = (subtaskIndex) => {
    if (!selectedCard) return;

    const { columnIndex, cardIndex } = selectedCard;
    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;

    const updated = [...columns];
    const subtasks = updated[columnIndex].cards[cardIndex].subtasks;
    if (subtaskIndex >= 0 && subtaskIndex < subtasks.length) {
      subtasks[subtaskIndex].completed = !subtasks[subtaskIndex].completed;
    }

    // Update the columns state
    setColumns(updated);

    // Ensure the selected card is updated with the latest subtasks array
    const updatedCard = updated[columnIndex].cards[cardIndex];
    setSelectedCard({
      ...selectedCard,
      subtasks: [...updatedCard.subtasks]
    });
  };


  const deleteSubtask = (subtaskIndex) => {
    if (!selectedCard) return;

    const { columnIndex, cardIndex } = selectedCard;
    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;

    const updated = [...columns];

    const subtasks = updated[columnIndex].cards[cardIndex].subtasks;
    if (subtaskIndex < 0 || subtaskIndex >= subtasks.length) return;

    updated[columnIndex].cards[cardIndex].subtasks.splice(subtaskIndex, 1);
    setColumns(updated);

    // Update the selected card to reflect changes
    const updatedSubtasks = [...selectedCard.subtasks];
    updatedSubtasks.splice(subtaskIndex, 1);

    setSelectedCard({
      ...selectedCard,
      subtasks: updatedSubtasks
    });
  };

  const handleUpdateCardDescription = (description) => {
    if (!selectedCard) return;

    const { columnIndex, cardIndex } = selectedCard;
    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;

    const updated = [...columns];
    updated[columnIndex].cards[cardIndex].description = description;
    setColumns(updated);

    // Update the selected card to reflect changes
    setSelectedCard({
      ...selectedCard,
      description
    });
  };

  const handleUpdateDueDate = (dueDate) => {
    if (!selectedCard) return;

    const { columnIndex, cardIndex } = selectedCard;
    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;

    const updated = [...columns];
    updated[columnIndex].cards[cardIndex].dueDate = dueDate;
    setColumns(updated);

    // Update the selected card to reflect changes
    setSelectedCard({
      ...selectedCard,
      dueDate
    });
  };

  // Updated to handle multiple user assignments
  const toggleUserAssignment = (userId) => {
    if (!selectedCard) return;

    const { columnIndex, cardIndex } = selectedCard;
    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;

    const updated = [...columns];

    const currentAssignees = updated[columnIndex].cards[cardIndex].assignedTo || [];

    // If user is already assigned, remove them, otherwise add them
    const newAssignees = currentAssignees.includes(userId)
      ? currentAssignees.filter(id => id !== userId)
      : [...currentAssignees, userId];

    updated[columnIndex].cards[cardIndex].assignedTo = newAssignees;
    setColumns(updated);

    // Update the selected card to reflect changes
    setSelectedCard({
      ...selectedCard,
      assignedTo: newAssignees
    });
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
    }

    setColumns(columnsCopy);
  };

  const openCardDetails = (columnIndex, cardIndex) => {
    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;

    const card = columns[columnIndex].cards[cardIndex];
    setSelectedCard({
      ...card,
      columnIndex,
      cardIndex,
      colTitle: columns[columnIndex].title
    });

    // Set initial state of collapsed sections to false (hidden)
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

  // Multi-avatar component that shows up to 3 avatars + count for extras
  const MultiAvatar = ({ assignedUsers }) => {
    if (!assignedUsers || assignedUsers.length === 0) return null;

    const users = assignedUsers.map(id => getTeamMember(id)).filter(Boolean);
    const displayUsers = users.slice(0, 3); // Show up to 3 avatars
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

  return (
    <div>
      <Navbar />
      <div className="ml-[15%] w-[85%] h-[9vh]">
        <ProjectHeader title="Kanban Board" />
      </div>
      <div className="p-4 font-sans ml-[15%] w-[85%] bg-[var(--background-primary)] text-[var(--text)] h-[91vh] overflow-y-auto">
        {/* Kanban Board */}
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
                                className="border rounded px-2 py-1 text-sm w-full bg-white text-gray-800"
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
                              onClick={() => confirmDeleteColumn(columnIndex)}
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
                              className={`flex-1 p-1 rounded min-h-[150px] transition-colors ${
                                snapshot.isDraggingOver ? "bg-blue-50" : ""
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
                                      className={`kanban-card bg-white p-3 rounded shadow mb-2 flex flex-col cursor-pointer hover:shadow-md transition-shadow relative ${
                                        snapshot.isDragging ? "shadow-lg" : ""
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
                                          <div className="text-sm font-medium">{card.title}</div>
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
                                          {card.assignedTo && card.assignedTo.length > 0 && (
                                            <div className="flex -space-x-2">
                                              {card.assignedTo.slice(0, 3).map((userId, index) => (
                                                <div key={userId} className="z-10" style={{ zIndex: 10 - index }}>
                                                  <Avatar user={getTeamMember(userId)} />
                                                </div>
                                              ))}
                                              {card.assignedTo.length > 3 && (
                                                <div className="z-0 flex items-center justify-center w-6 h-6 text-xs bg-gray-200 rounded-full border-2 border-white">
                                                  +{card.assignedTo.length - 3}
                                                </div>
                                              )}
                                            </div>
                                          )}
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

                        {/* Add Card UI */}
                        {showCardInput === columnIndex ? (
                          <AddTaskPopup
                            onAdd={(cardData) => addCard(columnIndex, cardData)}
                            onCancel={() => setShowCardInput(null)}
                          />
                        ) : (
                          <button
                            onClick={() => setShowCardInput(columnIndex)}
                            className="mt-2 text-sm text-gray-500 hover:text-blue-600 w-full py-1 bg-[var(--background-secondary)] rounded"
                          >
                            + Add Task
                          </button>
                        )}
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
                  <h2 className="font-bold text-[var(--text)] text-sm uppercase mb-3 p-2 bg-[var(--background-secondary)] rounded-t">
                    Add Column
                  </h2>
                  <input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Column name"
                    className="w-full px-2 py-1 text-sm border rounded mb-2 bg-white text-gray-800"
                  />
                  <button
                    onClick={addColumn}
                    className="w-full py-1 bg-[var(--background-secondary)] rounded text-sm text-gray-700 hover:text-black"
                  >
                    + Add Column
                  </button>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>


        {/* Card Detail Modal */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div className="w-full mr-2">
                  <input
                    type="text"
                    value={selectedCard.title}
                    onChange={(e) => handleUpdateCardTitle(e.target.value)}
                    className="text-xl font-bold mb-1 w-full border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none p-1"
                  />
                  <p className="text-sm text-gray-500">in list {selectedCard.colTitle}</p>
                </div>
                {selectedCard.tag && (
                  <div className="text-xs bg-blue-200 text-blue-800 rounded px-2 py-1">
                    {selectedCard.tag}
                  </div>
                )}
              </div>

              {/* Rearranged: Due Date on left, Assignment on right */}
              <div className="mb-4 flex items-start justify-between">
                <div className="w-1/2">
                  <h3 className="text-sm font-semibold mb-2">Due Date</h3>
                  <div className="flex items-center">
                    <input
                      type="date"
                      value={selectedCard.dueDate ? selectedCard.dueDate.split('T')[0] : ""}
                      onChange={(e) => handleUpdateDueDate(e.target.value)}
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
                <div className="w-1/2">
                  <h3 className="text-sm font-semibold mb-2">Assigned To</h3>
                  <div className="flex items-center flex-wrap gap-2">
                    {/* Display assigned members */}
                    {selectedCard.assignedTo && selectedCard.assignedTo.map(userId => (
                      <div key={userId} className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1">
                        <Avatar user={getTeamMember(userId)} />
                        <button
                          onClick={() => {
                            const newAssignees = selectedCard.assignedTo.filter(id => id !== userId);
                            const updated = [...columns];
                            const { columnIndex, cardIndex } = selectedCard;
                            updated[columnIndex].cards[cardIndex].assignedTo = newAssignees;
                            setColumns(updated);
                            setSelectedCard({
                              ...selectedCard,
                              assignedTo: newAssignees
                            });
                          }}
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
                      <div className="absolute mt-24 bg-white shadow-lg rounded p-2 border">
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
                              !(selectedCard.assignedTo || []).includes(member.id)
                            )
                            .map(member => (
                              <div
                                key={member.id}
                                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
                                onClick={() => {
                                  const newAssignees = [...(selectedCard.assignedTo || []), member.id];
                                  const updated = [...columns];
                                  const { columnIndex, cardIndex } = selectedCard;
                                  updated[columnIndex].cards[cardIndex].assignedTo = newAssignees;
                                  setColumns(updated);
                                  setSelectedCard({
                                    ...selectedCard,
                                    assignedTo: newAssignees
                                  });
                                  setSearchMember("");
                                  setShowMemberSearch(false);
                                }}
                              >
                                <Avatar user={member} />
                                <span className="text-sm">{member.name}</span>
                              </div>
                            ))}
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
                    onChange={(e) => handleUpdateCardDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="w-full border rounded p-2 text-sm min-h-[80px]"
                  />
                )}
              </div>

              {/* Subtasks Section */}
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

                {showSubtasks && (
                  <> {/* Use a fragment to group multiple elements */}
                    <div className="space-y-2 mb-3">
                      {selectedCard.subtasks?.map((subtask, index) => (
                        <div key={subtask.id} className="flex items-center bg-gray-50 p-2 rounded group">
                          {/* Improved checkbox button with better visibility for the checkmark */}
                          <button
                            onClick={() => toggleSubtask(index)}
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
                            onClick={() => toggleSubtask(index)}
                            className={`text-sm flex-1 cursor-pointer ${subtask.completed ? "line-through text-gray-400" : ""}`}
                          >
                            {subtask.title}
                          </span>

                          <button
                            onClick={() => deleteSubtask(index)}
                            className="text-gray-400 hover:text-red-500 text-xs"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center">
                      <input
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        placeholder="Add a subtask..."
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      />
                      <button
                        onClick={addSubtask}
                        className="ml-2 bg-blue-100 border border-blue-300 px-3 py-1 rounded text-blue-700 hover:bg-blue-200 text-sm"
                        disabled={!newSubtaskTitle.trim()}
                      >
                        Add
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-between items-center">
                {/* Delete Button (Left) */}
                <button
                  onClick={() => {
                    setConfirmDelete({
                      type: 'card',
                      columnIndex: selectedCard.columnIndex,
                      cardIndex: selectedCard.cardIndex
                    });
                    setSelectedCard(null);
                  }}
                  className="px-4 py-2 text-red-500 hover:text-red-700 rounded text-sm" // Red text, no background
                >
                  Delete
                </button>

                {/* Right Buttons (Cancel and Close) */}
                <div className="flex">
                  {/* Cancel Button (Left of Close) */}
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm mr-2" // White background, blue border/text
                  >
                    Cancel
                  </button>
                  {/* Close Button (Right) */}
                  <button
                     onClick={() => setSelectedCard(null)} // Close button
                     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm" // Blue background, white text
                  >
                    Close
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
              deleteCard(columnIndex, cardIndex, { stopPropagation: () => {} });
              setConfirmDelete(null);
            }}
            onClose={() => setConfirmDelete(null)}
          />
        )}

        {/* Confirm Delete Column Modal */}
        {confirmDelete && confirmDelete.type === 'column' && (
          <DeleteTaskPopup
            toggle={true}
            onSubmit={deleteColumn}
            onClose={() => setConfirmDelete(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Kanban;