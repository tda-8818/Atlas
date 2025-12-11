import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import CustomGantt from '../components/CustomGantt';
import AddTaskModal from '../components/modals/AddTaskModal';
import { useGetProjectTasksQuery, useGetProjectUsersQuery, useGetProjectColumnsQuery } from '../redux/slices/projectSlice';
import { useGetProjectSprintsQuery } from '../redux/slices/sprintSlice';
import { useUpdateTaskMutation } from '../redux/slices/taskSlice';

const GanttNew = () => {
  const { currentProject } = useOutletContext();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { data: projectTasks = [], isLoading } = useGetProjectTasksQuery(currentProject._id);
  const { data: teamMembers = [] } = useGetProjectUsersQuery(currentProject._id);
  const { data: columns = [] } = useGetProjectColumnsQuery(currentProject._id);
  const { data: sprints = [] } = useGetProjectSprintsQuery(currentProject._id);
  const [updateTask] = useUpdateTaskMutation();

  // Filter tasks that have both start and due dates
  const tasksWithDates = projectTasks.filter(task => task.startDate && task.dueDate);

  const handleTaskUpdate = async (updatedTask) => {
    try {
      await updateTask({
        _id: updatedTask._id,
        startDate: updatedTask.startDate,
        dueDate: updatedTask.dueDate
      }).unwrap();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskClick = (task) => {
    // Normalize task data to include 'id' field for AddTaskModal
    const normalizedTask = {
      ...task,
      id: task._id || task.id
    };
    setSelectedTask(normalizedTask);
    setShowAddTaskModal(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      await updateTask({
        _id: taskData._id || taskData.id,
        ...taskData
      }).unwrap();

      setShowAddTaskModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleCloseModal = () => {
    setShowAddTaskModal(false);
    setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading timeline...</div>
      </div>
    );
  }

  if (tasksWithDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No tasks with dates</h3>
        <p className="text-gray-500 text-center max-w-md">
          Add start and due dates to your tasks in the Kanban view to see them on the timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-4 sm:p-6 bg-[var(--background-primary)]">
      <CustomGantt
        tasks={tasksWithDates}
        onTaskUpdate={handleTaskUpdate}
        onTaskClick={handleTaskClick}
        columns={columns}
        sprints={sprints}
      />

      {showAddTaskModal && (
        <AddTaskModal
          show={showAddTaskModal}
          onCancel={handleCloseModal}
          onEdit={handleSaveTask}
          teamMembers={teamMembers}
          initialValues={selectedTask}
          projectId={currentProject._id}
        />
      )}
    </div>
  );
};

export default GanttNew;
