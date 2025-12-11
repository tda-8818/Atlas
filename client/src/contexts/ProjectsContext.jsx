/**
 * ProjectsContext.jsx
 * Provides shared access to projects data across the application
 * to prevent duplicate API calls
 */
import React, { createContext, useContext } from 'react';
import { useGetCurrentUserProjectsQuery, useGetCurrentUserNotificationsQuery } from '../redux/slices/projectSlice';
import { useGetCurrentUserQuery } from '../redux/slices/userSlice';

const ProjectsContext = createContext(null);

export const ProjectsProvider = ({ children }) => {
  // Check if user is authenticated before fetching projects
  const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery();

  // Fetch projects once at this level, only if user is authenticated
  const {
    data: projectsData = [],
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErrorData,
    refetch: refetchProjects,
  } = useGetCurrentUserProjectsQuery(undefined, {
    skip: !userData || userLoading, // Skip if no user data or user is still loading
  });

  // Fetch notifications once at this level, only if user is authenticated
  const {
    data: notificationData = [],
    refetch: refetchNotifications
  } = useGetCurrentUserNotificationsQuery(undefined, {
    skip: !userData || userLoading, // Skip if no user data or user is still loading
  });

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
