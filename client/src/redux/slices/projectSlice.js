/**
 * projectsSlice.js
 * Manages all project-related API queries and mutations with RTK Query.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const PROJECT_API_URL = import.meta.env.VITE_API_URL;

export const projectApiSlice = createApi({
  reducerPath: 'projectApi', // unique key for the projects slice
  baseQuery: fetchBaseQuery({
    baseUrl: PROJECT_API_URL,
    credentials: 'include',
  }),
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    // Fetch project details by project ID
    getProjectById: builder.query({
      query: (projectId) => `/projects/${projectId}`,
      providesTags: (result, error, projectId) => [{ type: 'Project', id: projectId }],
    }),

    // Fetch all projects (if needed, e.g., for listing user's projects)
    getCurrentUserProjects: builder.query({
      query: () => '/projects',
      providesTags: (result = [], error, arg) =>
        result
          ? [
              ...result.map((project) => ({ type: 'Project', id: project._id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),

    // Create a new project
    createProject: builder.mutation({
      query: (newProject) => ({
        url: '/projects',
        method: 'POST',
        body: newProject,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    // Update an existing project
    updateProject: builder.mutation({
      query: (updatedProject) => ({
        url: `/projects/${updatedProject._id}`,
        method: 'PUT',
        body: updatedProject,
      }),
      invalidatesTags: (result, error, updatedProject) => [
        { type: 'Project', id: updatedProject._id },
      ],
    }),

    // Delete a project
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, projectId) => [{ type: 'Project', id: projectId }],
    }),

     // Fetch tasks by project ID
    getProjectTasks: builder.query({
      query: (projectId) => `/tasks/${projectId}`,                        // change task route to fetch project tasks
      providesTags: (result, error, projectId) => [{ type: 'Task', id: projectId }],
    }),

    /** USER-PROJECT RELATED QUERIES */
    // Get all users in a project
    getProjectUsers: builder.query({
      query: (projectId) => `/projects/${projectId}/users`,                       
      providesTags: (result, error, projectId) => [
        { type: 'User', id: projectId },
        { type: 'Project', id: projectId }
      ],
    }),

    updateProjectUsers: builder.mutation({
      query: ({ projectId, owner, users }) => ({
        url: `/projects/${projectId}/users`,
        method: 'PUT',
        body: { owner, users }
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'User', id: projectId },
        { type: 'Project', id: projectId }
      ]
    }),

  }),
});

// Export hooks for usage in functional components
export const {
  useGetProjectByIdQuery,
  useGetCurrentUserProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectUsersQuery,
  useGetProjectTasksQuery,
  useUpdateProjectUsersMutation,
} = projectApiSlice;

export default projectApiSlice;