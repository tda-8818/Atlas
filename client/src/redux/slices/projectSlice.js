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

    /** USER-PROJECT RELATED QUERIES */
    // Get all users in a project
    getProjectUsers: builder.query({
      query: (projectId) => `/users/${projectId}`,                       
      providesTags: (result, error, projectId) => [{ type: 'User', id: projectId }],
    }),

    addTeamMember: builder.mutation({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/users`,
        method: 'POST',
        body: { userId }
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }]
    }),

    // If you need to update owner
    updateProjectOwner: builder.mutation({
      query: ({ projectId, ownerId }) => ({
        url: `/projects/${projectId}/owner`,
        method: 'PUT',
        body: { ownerId }
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId }
      ]
    }),
    
    removeTeamMember: builder.mutation({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/users/${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }]
    })

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
  useAddTeamMemberMutation,
  useUpdateProjectOwnerMutation,
  useRemoveTeamMemberMutation,
} = projectApiSlice;

export default projectApiSlice;