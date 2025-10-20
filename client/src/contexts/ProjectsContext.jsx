/**
 * ProjectsContext.jsx
 * Provides shared access to projects data across the application
 * to prevent duplicate API calls
 */
import React, { createContext, useContext } from 'react';
import { useGetCurrentUserProjectsQuery, useGetCurrentUserNotificationsQuery } from '../redux/slices/projectSlice';

const ProjectsContext = createContext(null);

export const ProjectsProvider = ({ children }) => {
  // Fetch projects once at this level
  const {
    data: projectsData = [],
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErrorData,
    refetch: refetchProjects,
  } = useGetCurrentUserProjectsQuery();

  // Fetch notifications once at this level
  const {
    data: notificationData = [],
    refetch: refetchNotifications
  } = useGetCurrentUserNotificationsQuery();

  const value = {
    projectsData,
    projectsLoading,
    projectsError,
    projectsErrorData,
    refetchProjects,
    notificationData,
    refetchNotifications,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

// Custom hook to use the projects context
export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

export default ProjectsContext;
