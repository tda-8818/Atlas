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
      query: (id) => `/projects/${id}/users`,
      providesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'Project', id }
      ],
    }),

    updateProjectUsers: builder.mutation({
      query: ({ id, owner, users }) => ({
        url: `/projects/${id}/users`,
        method: 'PUT',
        body: { owner, users }
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id},
        { type: 'Project', id}
      ]
    }),

    /**
     * START OF COLUMN OPERATIONS FOR KANBAN
     * START OF COLUMN OPERATIONS FOR KANBAN
     * START OF COLUMN OPERATIONS FOR KANBAN
     */
    // Get all columns in a project
    getProjectColumns: builder.query({
      query: (projectId) => `/projects/${projectId}/kanban`,
    }),

    // Create column
    createColumn: builder.mutation({
      query: ({ projectId, columnData }) => ({
        url: `/projects/${projectId}/kanban`,
        method: 'POST',
        body: columnData,
      }),
    }),

    // Update a column
    updateColumn: builder.mutation({
      query: ({ projectId, columnId, updates }) => ({
        url: `projects/${projectId}/kanban/${columnId}`,
        method: 'PUT',
        body: updates,
      }),
    }),

    // Delete a column
    deleteColumn: builder.mutation({
      query: ({ projectId, columnId }) => ({
        url: `projects/${projectId}/kanban/${columnId}`,
        method: 'DELETE',
      }),
    }),

    // Reorder columns
    reorderColumns: builder.mutation({
      query: ({ projectId, reorderedColumns }) => ({
        url: `projects/${projectId}/kanban/reorder`,
        method: 'PUT',
        body: { columns: reorderedColumns },
      }),
    }),

    /**
     * END OF COLUMN OPERATIONS FOR KANBAN
     * END OF COLUMN OPERATIONS FOR KANBAN
     * END OF COLUMN OPERATIONS FOR KANBAN
     */

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