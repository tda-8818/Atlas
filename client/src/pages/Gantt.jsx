import React from 'react';
import Navbar from '../components/Navbar';
import GanttComp from '../components/GanttComp';
import ProjectHeader from '../components/ProjectHeader';
import { useOutletContext } from 'react-router-dom';
import {
  useAddTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useGetTasksByProjectQuery
} from '../redux/slices/taskSlice';

const Gantt = () => {
  const { currentProject } = useOutletContext();

  const [addTask] = useAddTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [editTask] = useUpdateTaskMutation();
  const { data: projectTasks = [], isLoading, isError } = useGetTasksByProjectQuery(currentProject._id);

  // Format tasks for DHTMLX Gantt
  const formattedData = {
    data: projectTasks.map(task => ({
      id: task._id,
      text: task.title,
      start_date: task.start, // make sure this is in Gantt-compatible format
      duration: task.duration,
      progress: task.progress || 0,
    })),
    links: [] // optionally add real links here
  };

  return (
    <div className="flex h-screen ">
      <Navbar />
      <main className="ml-[15%] w-[85%] flex flex-col bg-[var(--background-primary)]">
        <div className="flex-none">
          <ProjectHeader project={currentProject} />
        </div>
        <div className="flex-1 p-2">
          <div className="w-full h-full">
            <GanttComp
              tasks={formattedData}
              addTask={addTask}
              deleteTask={deleteTask}
              editTask={editTask}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Gantt;
