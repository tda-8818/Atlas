// components/ProjectCard.jsx
import React from "react";
import { useGetProjectTasksQuery } from "../redux/slices/projectSlice";
import { calculateProgress, calculateDaysLeft, isProjectOwner } from "../utils/projectUtils";
import UserAvatar from "./avatar/UserAvatar";
import { LuClock } from "react-icons/lu";
import { useGetCurrentUserQuery } from "../redux/slices/userSlice";


const ProjectCard = ({ project, users, onProjectClick, onRequestDelete }) => {
  // Assume your getProjectTasks query takes a project ID as its argument.
  const { data: tasks = [], isLoading: tasksLoading, isError: tasksError } =
    useGetProjectTasksQuery(project.id);

  const {data: currentUser} = useGetCurrentUserQuery();

  // Calculate progress if tasks are available.
  const progress = tasks && tasks.length > 0 ? calculateProgress(tasks) : 0;

  return (
    <div
      className="relative bg-[var(--background)] rounded-2xl shadow-md p-5 w-[300px] cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => onProjectClick(project)}
    >
      {/* Delete Button */}
      {isProjectOwner(currentUser?.user.id, project.owner) && <button
        onClick={(e) => {
          e.stopPropagation();
          onRequestDelete(project);
        }}
        className="absolute p-1 top-2 right-2 text-gray-400 hover:text-red-500 cursor-pointer"
        title="Delete Project"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </button>}

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">{project.title}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">{project.description}</p>
        </div>

        <div>
          <div className="flex justify-between items-center text-sm text-[var(--text)] mb-1">
            <span>Progress</span>
            <span>{tasksLoading ? "Loading..." : `${progress}%`}</span>
          </div>
          <div className="w-full bg-[var(--background-primary)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[var(--color-primary)] h-2 rounded-full"
              style={{ width: tasksLoading ? "0%" : `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-[var(--text)] mt-3">
          <div className="flex items-center gap-1">
            <LuClock />
            <span>
              {project.startDate && project.endDate
                ? `${Math.max(0, calculateDaysLeft(project.startDate, project.endDate))} Days Left`
                : "N/A"}
            </span>
          </div>
          <div className="flex -space-x-2">
            {users && users.length > 0 ? (
              users.map((user, i) => <UserAvatar key={i} user={user} size={6} />)
            ) : (
              <span className="text-xs text-gray-400">Loading...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;