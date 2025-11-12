// components/ProjectCard.jsx
import React, { useMemo } from "react";
import { useGetProjectTasksQuery } from "../redux/slices/projectSlice";
import { calculateProgress, calculateDaysLeft, isProjectOwner } from "../utils/projectUtils";
import UserAvatar from "./avatar/UserAvatar";
import { LuClock, LuTrash2 } from "react-icons/lu";
import { MdOutlineFolderOpen } from "react-icons/md";
import { useGetCurrentUserQuery } from "../redux/slices/userSlice";


const ProjectCard = ({ project, users, onProjectClick, onRequestDelete }) => {
  const { data: tasks = [], isLoading: tasksLoading } = useGetProjectTasksQuery(project.id);
  const { data: currentUser } = useGetCurrentUserQuery();

  // Memoize expensive calculations
  const progress = useMemo(() => {
    return tasks && tasks.length > 0 ? calculateProgress(tasks) : 0;
  }, [tasks]);

  const daysLeft = useMemo(() => {
    if (!project.startDate || !project.dueDate) return null;
    return Math.max(0, calculateDaysLeft(project.startDate, project.dueDate));
  }, [project.startDate, project.dueDate]);

  const isOwner = useMemo(() => {
    return isProjectOwner(currentUser?.user.id, project.owner);
  }, [currentUser?.user.id, project.owner]);

  // Determine progress bar color based on progress
  const progressColor = useMemo(() => {
    if (progress >= 75) return 'from-green-500 to-green-600';
    if (progress >= 50) return 'from-[#0b80c3] to-[#0d9ae6]';
    if (progress >= 25) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  }, [progress]);

  return (
    <div
      className="relative bg-white/70 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-lg border border-[#bbdefb]/50 p-4 sm:p-6 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
      onClick={() => onProjectClick(project)}
    >
      {/* Delete Button - Always visible on mobile, hidden until hover on desktop */}
      {isOwner && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete(project);
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/80 text-[#546e7a] hover:bg-red-50 hover:text-red-500 transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
          title="Delete Project"
        >
          <LuTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}

      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Project Icon and Title */}
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0b80c3] to-[#0d9ae6] flex items-center justify-center shadow-md shrink-0">
            <MdOutlineFolderOpen className="text-white text-xl sm:text-2xl" />
          </div>
          <div className="flex-1 min-w-0 pr-8 sm:pr-0">
            <h2 className="text-base sm:text-lg font-bold text-[#0a1929] truncate group-hover:text-[#0b80c3] transition-colors duration-300">
              {project.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#546e7a] line-clamp-2 mt-1">
              {project.description || "No description"}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-[#546e7a] font-medium">Progress</span>
            <span className="text-[#0a1929] font-bold">
              {tasksLoading ? (
                <span className="inline-block w-10 sm:w-12 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></span>
              ) : (
                `${progress}%`
              )}
            </span>
          </div>
          <div className="w-full bg-[#e3f2fd] h-2 sm:h-2.5 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-2 sm:h-2.5 rounded-full bg-gradient-to-r ${progressColor} transition-all duration-500 shadow-sm`}
              style={{ width: tasksLoading ? "0%" : `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Footer with Time and Users */}
        <div className="flex justify-between items-center pt-1.5 sm:pt-2 border-t border-[#bbdefb]/30">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#546e7a]">
            <LuClock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">
              {daysLeft !== null ? `${daysLeft} Days Left` : "No deadline"}
            </span>
          </div>
          <div className="flex items-center">
            {users && users.length > 0 ? (
              <div className="flex -space-x-1.5 sm:-space-x-2">
                {users.slice(0, 3).map((user, i) => (
                  <UserAvatar key={i} user={user} size={7} />
                ))}
                {users.length > 3 && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#0b80c3] to-[#0d9ae6] flex items-center justify-center text-[9px] sm:text-[10px] text-white font-bold shadow-md border-2 border-white">
                    +{users.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;