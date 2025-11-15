import React, { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddTaskModal from '../components/modals/AddTaskModal';
import FilterBar from '../components/FilterBar';
import { useOutletContext } from "react-router-dom";
import { useAddTaskMutation, useDeleteTaskMutation, useUpdateTaskMutation, useCreateSubTaskMutation } from "../redux/slices/taskSlice";
import { useCreateColumnMutation, useDeleteColumnMutation, useGetProjectColumnsQuery, useGetProjectTasksQuery, useUpdateColumnMutation, useGetProjectUsersQuery } from "../redux/slices/projectSlice";
import { useGetProjectLabelsQuery } from '../redux/slices/labelSlice';
import { useGetProjectSprintsQuery } from '../redux/slices/sprintSlice';
import { TaskTypeIcon, getTaskTypeConfig } from '../utils/taskTypeUtils';
import UserAvatar from '../components/avatar/UserAvatar';

// Priority levels used in the app
const priorityLevels = ['none', '!', '!!', '!!!'];


const Kanban = () => {
  const [columns, setColumns] = useState([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskColumnIndex, setAddTaskColumnIndex] = useState(null);

  const [newColumnName, setNewColumnName] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [editingColumnIndex, setEditingColumnIndex] = useState(null);
  const [editColumnName, setEditColumnName] = useState("");

  const [showDescription, setShowDescription] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const [currentCardIndex, setCurrentCardIndex] = useState(null);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(null);

  // Phase 2: Filter state
  const [filters, setFilters] = useState({
    searchQuery: '',
    priorities: [],
    labels: [],
    assignees: [],
    taskTypes: [],
    showCompleted: true,
    quickFilter: null
  });

  // Ref for the card detail modal content
  const cardModalRef = useRef(null);

  const { currentProject, user } = useOutletContext();

  /// RTK QUERY FUNCTIONS ///
  const [addTask] = useAddTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [editTask] = useUpdateTaskMutation();
  const [createSubTask] = useCreateSubTaskMutation();

  const [createColumn] = useCreateColumnMutation();
  const [updateColumn] = useUpdateColumnMutation();
  const [deleteColumn] = useDeleteColumnMutation();

  const { data: projectTasks, isLoading, isError, refetch} = useGetProjectTasksQuery(currentProject._id);
  const { data: columnData} = useGetProjectColumnsQuery(currentProject._id);
  const { data: teamMembers } = useGetProjectUsersQuery(currentProject._id);
  const { data: projectLabels } = useGetProjectLabelsQuery(currentProject._id);
  const { data: projectSprints } = useGetProjectSprintsQuery(currentProject._id);
  

  // Filter function to apply all active filters
  const applyFilters = (task) => {
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = task.title?.toLowerCase().includes(query);
      const matchesDescription = task.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription) return false;
    }

    // Priority filter
    if (filters.priorities.length > 0) {
      if (!filters.priorities.includes(task.priority)) return false;
    }

    // Label filter
    if (filters.labels.length > 0) {
      if (!task.labels || task.labels.length === 0) return false;
      const taskLabelIds = task.labels.map(l => l._id || l);
      const hasMatchingLabel = filters.labels.some(filterId => taskLabelIds.includes(filterId));
      if (!hasMatchingLabel) return false;
    }

    // Assignee filter
    if (filters.assignees.length > 0) {
      if (filters.assignees.includes('unassigned')) {
        if (task.assignedTo && task.assignedTo.length > 0) return false;
      } else {
        if (!task.assignedTo || task.assignedTo.length === 0) return false;
        const taskAssigneeIds = task.assignedTo.map(a => a._id || a);
        const hasMatchingAssignee = filters.assignees.some(filterId => taskAssigneeIds.includes(filterId));
        if (!hasMatchingAssignee) return false;
      }
    }

    // Task type filter
    if (filters.taskTypes.length > 0) {
      if (!filters.taskTypes.includes(task.taskType || 'task')) return false;
    }

    // Sprint filter
    if (filters.sprint && filters.sprint !== 'all') {
      if (filters.sprint === 'backlog') {
        // Show only tasks without a sprint
        if (task.sprintId) return false;
      } else {
        // Show only tasks in the selected sprint
        if (task.sprintId !== filters.sprint) return false;
      }
    }

    // Completed filter
    if (!filters.showCompleted && task.status === true) {
      return false;
    }

    return true;
  };

  const mapTasksToColumns = () => {
    if (!columnData || !projectTasks) return [];

    return columnData.map(column => ({
      id: column._id,
      title: column.title,
      cards: projectTasks
        .filter(task => task.columnId === column._id)
        .filter(applyFilters)
        .map(task => ({
          ...task,
          id: String(task._id),
        }))
    }));
  }

  // Update columns when project data changes
  useEffect(() => {
    refetch();
    if (!currentProject || !projectTasks) return;

    const formatted = mapTasksToColumns();
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


  }, [columnData, projectTasks, filters]); // Added columns to dependencies because handleSaveChanges uses it, filters for real-time filtering



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

    try {
      const newColumn = {
        title: newColumnName,
        index: columns.length,
      };

      const response = await createColumn({
        projectId: currentProject._id,
        columnData: newColumn
      }).unwrap();

      setColumns([
        ...columns,
        {
          id: response._id,
          title: response.title,
          cards: [],
        },
      ]);

      setNewColumnName("");
      setShowAddColumn(false);
    } catch (error) {
      console.error("Failed to create column:", error);
    }
  };


  const handleAddTaskFromPopup = async (cardData) => {

    if (!cardData.title) {
      console.warn("Missing task title!")
      return;
    }

    if (
      addTaskColumnIndex === null ||
      addTaskColumnIndex < 0 ||
      addTaskColumnIndex >= columns.length
    ) {
      console.error("Attempted to add task to invalid column index.");
      setShowAddTaskModal(false);
      setAddTaskColumnIndex(null);
      return;
    }

    const columnId = columns[addTaskColumnIndex].id;


    try {
      // Extract subtasks from cardData before creating task
      const { subtasks, ...taskDataWithoutSubtasks } = cardData;

      const response = await addTask({
        ...taskDataWithoutSubtasks,
        columnId,
        projectId: currentProject._id,
        startDate: cardData.startDate ? new Date(cardData.startDate) : undefined,
        dueDate: cardData.dueDate ? new Date(cardData.dueDate) : undefined,
      }).unwrap();


      // Create subtasks if any were provided
      if (subtasks && subtasks.length > 0) {
        for (const subtask of subtasks) {
          try {
            await createSubTask({
              taskId: response._id,
              subtask: {
                title: subtask.title,
                priority: subtask.priority || 'none',
                status: subtask.status || false
              }
            }).unwrap();
          } catch (subtaskError) {
            console.error("Failed to create subtask:", subtaskError);
          }
        }
      }

      const updated = [...columns];
      updated[addTaskColumnIndex].cards.push({
        ...response,
        id: response._id,
      });
      setColumns(updated);
    } catch (error) {
      console.error("Failed to create task:", error);
    }

    setShowAddTaskModal(false);
    setAddTaskColumnIndex(null);
  };


  const openAddTaskModal = (columnIndex) => {
    setAddTaskColumnIndex(columnIndex);
    setSelectedCard(null); // Reset selected card when opening the add task popup
    setShowAddTaskModal(true);
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
  const handleDeleteCard = () => {
    deleteCard(currentCardIndex, currentColumnIndex);
  };
  const deleteCard = async (columnIndex, cardIndex, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (columnIndex < 0 || columnIndex >= columns.length) return;
    if (cardIndex < 0 || cardIndex >= columns[columnIndex].cards.length) return;


    const cardToDelete = columns[columnIndex].cards[cardIndex];
    //const columnId = columns[columnIndex].id;
    try {
      await deleteTask(
        cardToDelete._id,
      ).unwrap();

      const updated = [...columns];
      updated[columnIndex].cards.splice(cardIndex, 1);
      setColumns(updated);

      setSelectedCard(null);
      setConfirmDelete(null);
      setCurrentCardIndex(null);
      setCurrentColumnIndex(null);
      setShowAddTaskModal(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
      // Optionally show a toast or user message here
    }
  };

  // Function to save changes from the selectedCard state to the main columns state
  const handleSaveChanges = async (cardData) => {
    if (!cardData) {
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
    const newCardData = {
      ...cardData,
      _id: cardData.id
    };
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
      const response = await editTask(newCardData).unwrap();


      const updatedColumns = [...columns];

      updatedColumns[columnIndex].cards[cardIndex] = {
        ...updatedColumns[columnIndex].cards[cardIndex],
        ...response, // Overwrite with fresh backend data
      };


      // Set selectedCard to null AFTER the state update to close the modal
      setColumns(updatedColumns);
      setSelectedCard(null);
       setShowAddTaskModal(false);
    } catch (error) {
      console.error("Failed to update task in Kanban.jsx", error);
    }
   
  };

  // Function to close the modal WITHOUT saving changes
  const handleCloseCardDetails = () => {
    // This function should strictly close the modal and discard changes.
    setSelectedCard(null);
    setShowMemberSearch(false);
    setCurrentCardIndex(null);
    setCurrentColumnIndex(null);
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
      startDate: card.startDate ? new Date(card.startDate) : null,
      dueDate: card.dueDate ? new Date(card.dueDate) : null,
      subtasks: card.subtasks || [],
    });


    setCurrentCardIndex(cardIndex);
    setCurrentColumnIndex(columnIndex);
    setShowAddTaskModal(true);
  };

  // Toggle section visibility functions
  const toggleDescriptionSection = () => {
    setShowDescription(!showDescription);
  };

  const toggleSubtasksSection = () => {
    setShowSubtasks(!showSubtasks);
  };

  // // Multi-avatar component
  // const MultiAvatar = ({ assignedUsers }) => {
  //   if (!assignedUsers || assignedUsers.length === 0) return null;

  //   const users = assignedUsers.map(id => getTeamMember(id)).filter(Boolean);
  //   const displayUsers = users.slice(0, 3);
  //   const extraCount = users.length - displayUsers.length;

  //   return (
  //     <div className="flex -space-x-2 items-center">
  //       {displayUsers.map((user, index) => (
  //         <div key={user.id} className="z-10" style={{ zIndex: 10 - index }}>
  //           <Avatar user={user} />
  //         </div>
  //       ))}
  //       {extraCount > 0 && (
  //         <div className="z-0 flex items-center justify-center w-6 h-6 text-xs bg-gray-200 rounded-full border-2 border-white">
  //           +{extraCount}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };


  return (
    <div className="p-4 sm:p-6 bg-[var(--background-primary)] text-[var(--text)] h-full overflow-y-auto">
      {/* Phase 2: Filter Bar */}
      <FilterBar
        onFilterChange={setFilters}
        teamMembers={teamMembers || []}
        availableLabels={projectLabels || []}
        availableSprints={projectSprints || []}
        currentUserId={user?._id}
      />

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
                        className="kanban-column bg-[var(--background)] rounded-xl border border-gray-200/50 flex flex-col"
                        style={{
                          ...provided.draggableProps.style,
                          width: "300px",
                          minWidth: "300px",
                          marginRight: "16px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
                        }}
                      >
                        {/* Column Header */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex flex-col mb-2 p-4 pb-3 border-b border-gray-100"
                        >
                          <div className="flex justify-between items-center mb-2">
                            {editingColumnIndex === columnIndex ? (
                              <div className="flex-1">
                                <input
                                  value={editColumnName}
                                  onChange={(e) => setEditColumnName(e.target.value)}
                                  className="border-2 border-blue-500 rounded-lg px-3 py-2 text-sm w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                  autoFocus
                                  onBlur={saveColumnName}
                                  onKeyDown={handleColumnNameKeyDown}
                                />
                              </div>
                            ) : (
                              <h2
                                className="font-semibold text-[var(--text)] text-base cursor-pointer hover:text-blue-600 transition-colors flex-1"
                                onDoubleClick={() => startEditingColumnName(columnIndex)}
                              >
                                {column.title}
                              </h2>
                            )}

                            {editingColumnIndex !== columnIndex && (
                              <button
                                onClick={()=>{ setConfirmDelete({
                                  type: 'column',
                                  index: columnIndex
                                }); removeColumn();}}
                                className="text-gray-400 hover:text-red-500 transition-colors ml-2 p-1 hover:bg-red-50 rounded"
                                disabled={columns.length <= 1}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Column Stats */}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {column.cards.length} {column.cards.length === 1 ? 'task' : 'tasks'}
                            </span>
                            {column.cards.reduce((sum, card) => sum + (card.storyPoints || 0), 0) > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                {column.cards.reduce((sum, card) => sum + (card.storyPoints || 0), 0)} pts
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cards Container */}
                        <Droppable droppableId={column.id} type="card">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex-1 px-3 pb-2 rounded min-h-[150px] transition-all duration-200 ${snapshot.isDraggingOver ? "bg-blue-50/50" : ""
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
                                      className={`kanban-card p-3 rounded shadow mb-2 flex flex-col cursor-pointer hover:shadow-md transition-all relative ${
                                        snapshot.isDragging ? "shadow-lg" : ""
                                      } ${
                                        card.status ? "border-2 border-gray-300" : ""
                                      }`}
                                      onClick={() => openCardDetails(columnIndex, cardIndex)}
                                    >
                                      {/* Completed Badge */}
                                      {card.status && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md z-10 border-2 border-white">
                                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      )}

                                      {/* Header with Task Type Icon and Story Points */}
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 flex-1">
                                          {/* Task Type Icon */}
                                          <TaskTypeIcon type={card.taskType || 'task'} size="md" />

                                          <div className="flex-1">
                                            <div className={`text-sm font-medium flex items-center ${card.status ? "line-through text-gray-400" : ""}`}>
                                              {/* Display Priority in front of task name */}
                                              {card.priority && card.priority !== 'none' && (
                                                <span className={`mr-1 text-xs font-bold ${card.status ? "text-gray-400" : "text-red-500"}`}>
                                                  {card.priority}
                                                </span>
                                              )}
                                              {card.title}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Story Points Badge */}
                                        {card.storyPoints > 0 && (
                                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-xs font-semibold ml-2 flex-shrink-0">
                                            {card.storyPoints}
                                          </div>
                                        )}
                                      </div>

                                      {/* Labels */}
                                      {card.labels && card.labels.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {card.labels.slice(0, 3).map((label) => (
                                            <span
                                              key={label._id}
                                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                              style={{ backgroundColor: label.color }}
                                              title={label.name}
                                            >
                                              {label.name}
                                            </span>
                                          ))}
                                          {card.labels.length > 3 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                                              +{card.labels.length - 3}
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      {card.description && (
                                        <div className={`text-xs mb-2 truncate ${card.status ? "text-gray-400 line-through" : "text-gray-600"}`}>
                                          {card.description.substring(0, 60)}
                                          {card.description.length > 60 ? "..." : ""}
                                        </div>
                                      )}

                                      <div className="flex justify-between items-center mt-auto pt-2">
                                        {/* Due Date on the left with red color if overdue */}
                                        {card.dueDate && (
                                          <div className="flex items-center">
                                            <div className={`text-xs ${getEmergencyLevel(card.dueDate) === 'overdue' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                              {formatDate(card.dueDate)}
                                            </div>
                                          </div>
                                        )}

                                        {/* Right side with subtask counter and assigned users */}
                                        <div className="flex items-center ml-auto gap-2">
                                          {/* Subtask counter */}
                                          {card.subtasks && card.subtasks.length > 0 && (
                                            <div className={`text-xs rounded-full px-1.5 py-0.5 flex items-center ${
                                              card.subtasks.filter(st => st.completed).length === card.subtasks.length
                                                ? 'bg-green-100 text-green-800'
                                                : (card.subtasks.filter(st => st.completed).length > 0
                                                  ? 'bg-orange-100 text-orange-800'
                                                  : 'bg-gray-100 text-gray-600')
                                            }`}>
                                              {card.subtasks.filter(st => st.completed).length === card.subtasks.length && (
                                                <svg className="w-3 h-3 mr-0.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                              )}
                                              {card.subtasks.filter(st => st.completed).length}/{card.subtasks.length}
                                            </div>
                                          )}

                                          {/* Assigned User Avatars */}
                                          {card.assignedTo && card.assignedTo.length > 0 && (
                                            <div className="flex -space-x-2">
                                              {card.assignedTo.slice(0, 3).map((user, idx) => (
                                                <div key={user._id || idx} className="relative">
                                                  <UserAvatar user={user} size={6} />
                                                </div>
                                              ))}
                                              {card.assignedTo.length > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                                  <span className="text-xs font-medium text-gray-600">+{card.assignedTo.length - 3}</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {/* Button to open the AddTaskModal */}
                        <button
                          onClick={() => openAddTaskModal(columnIndex)}
                          className="mx-3 mb-3 mt-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 w-auto px-3 py-2 bg-transparent rounded-lg transition-all duration-200 flex items-center gap-2 font-medium group"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Task
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {/* Add Column UI */}
                {showAddColumn ? (
                  <div
                    className="bg-[var(--background)] rounded-xl border border-gray-200/50 p-4"
                    style={{
                      width: "300px",
                      minWidth: "300px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
                    }}
                  >
                    <input
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newColumnName.trim()) {
                          addColumn();
                        }
                        if (e.key === 'Escape') {
                          setShowAddColumn(false);
                          setNewColumnName("");
                        }
                      }}
                      onBlur={() => {
                        if (newColumnName.trim()) {
                          addColumn();
                        } else {
                          setShowAddColumn(false);
                          setNewColumnName("");
                        }
                      }}
                      placeholder="Column name"
                      className="w-full text-sm px-3 py-2.5 bg-white border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-gray-800 placeholder-gray-400"
                      autoFocus
                    />
                    <div className="mt-2 text-xs text-gray-500 px-1">
                      Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 font-mono">Enter</kbd> to save • <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 font-mono">Esc</kbd> to cancel
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddColumn(true)}
                    className="flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium">Add Column</span>
                  </button>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Render the reusable AddTaskModal */}
        <AddTaskModal
          show={showAddTaskModal}
          onAddTask={handleAddTaskFromPopup}
          onCancel={() => {
            setShowAddTaskModal(false);
            setAddTaskColumnIndex(null);
          }}
          onEdit={handleSaveChanges}
          onDelete={handleDeleteCard}
          teamMembers={teamMembers}
          initialValues={selectedCard}
          projectId={currentProject._id}
        />

    </div>
  );
};

export default Kanban;