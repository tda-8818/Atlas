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
      query: (projectId) => `/api/projects/${projectId}`,
      providesTags: (result, error, projectId) => [{ type: 'Project', id: projectId }],
    }),

    // Fetch all projects (if needed, e.g., for listing user's projects)
    getCurrentUserProjects: builder.query({
      query: () => '/api/projects',
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
        url: '/api/projects',
        method: 'POST',
        body: newProject,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    // Update an existing project
    updateProject: builder.mutation({
      query: (updatedProject) => ({
        url: `/api/projects/${updatedProject._id}`,
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
        url: `/api/projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, projectId) => [{ type: 'Project', id: projectId }],
    }),

     // Fetch tasks by project ID
    getProjectTasks: builder.query({
      query: (projectId) => `/api/tasks/${projectId}`,                      
      providesTags: (result, error, projectId) => [{ type: 'Task', id: projectId }],
    }),
    invalidatesTags: (result, error, projectId) => [{ type: 'Task', id: projectId }],

    /** USER-PROJECT RELATED QUERIES */

    // Get all users in a project
    getProjectUsers: builder.query({
      query: (id) => `/api/projects/${id}/users`,
      providesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'Project', id }
      ],
    }),

    updateProjectUsers: builder.mutation({
      query: ({ id, owner, users }) => ({
        url: `/api/projects/${id}/users`,
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
     */
    // Get all columns in a project
    getProjectColumns: builder.query({
      query: (projectId) => `/api/projects/${projectId}/kanban`,
    }),

    // Create column
    createColumn: builder.mutation({
      query: ({ projectId, columnData }) => ({
        url: `/api/projects/${projectId}/kanban`,
        method: 'POST',
        body: columnData,
      }),
    }),

    // Update a column
    updateColumn: builder.mutation({
      query: ({ projectId, columnId, updates }) => ({
        url: `/api/projects/${projectId}/kanban/${columnId}`,
        method: 'PUT',
        body: updates,
      }),
    }),

    // Delete a column
    deleteColumn: builder.mutation({
      query: ({ projectId, columnId }) => ({
        url: `/api/projects/${projectId}/kanban/${columnId}`,
        method: 'DELETE',
      }),
    }),

    // Reorder columns
    reorderColumns: builder.mutation({
      query: ({ projectId, reorderedColumns }) => ({
        url: `/api/projects/${projectId}/kanban/reorder`,
        method: 'PUT',
        body: { columns: reorderedColumns },
      }),
    }),

    /**
     * END OF COLUMN OPERATIONS FOR KANBAN
     * END OF COLUMN OPERATIONS FOR KANBAN
     * END OF COLUMN OPERATIONS FOR KANBAN
     */
      // 1. Send Invite (Creates Notification)
    inviteUserToProject: builder.mutation({
      query: ({ projectId, senderId, recipientId, timeSent }) => ({
        url: `/api/projects/${projectId}/invite`,
        method: 'POST',
        body: { senderId, recipientId, timeSent },
      }),
      invalidatesTags: ['Notification', 'User'],
    }),

    // 2. Delete Notification
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/api/projects/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    // 3. Mark Notification as Read
    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/api/projects/notifications/${notificationId}/read`,
        method: 'PATCH', // PATCH is more semantically appropriate for partial updates
      }),
      invalidatesTags: ['Notification'],
    }),

    // 4. Mark Notification as Read
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: `/api//notifications/mark-all-read`,
        method: 'PATCH'
      }),
    }),

    // 5. Accept Invite (Add user to project and vice versa)
    acceptProjectInvite: builder.mutation({
      query: ({ userId, projectId }) => ({
        url: `/api/projects/${projectId}/accept/${userId}`,
        method: 'POST',
        body: { projectId },
      }),
      invalidatesTags: ['User', 'Project'],
    }),

    getCurrentUserNotifications: builder.query({
      query: () => `/api/projects/notifications`,
      providesTags: (result) =>
        result
          ? [...result.map((notif) => ({ type: 'Notification', id: notif._id })), { type: 'Notification', id: 'LIST' }]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    /*

    EXAMPLE USAGE
      updateNotification({ 
        notificationId: '123456',
        updateFields: { responded: true, accepted: true, isUnread: false }
      });

    */
    updateNotification: builder.mutation({
    query: ({ notificationId, updateFields }) => ({
      url: `/api/projects/notifications/${notificationId}`,
      method: 'PATCH',
      body: updateFields // updateFields is an object like { responded: true, accepted: false, isUnread: false }
    }),
      
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
  useGetProjectColumnsQuery,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
  useReorderColumnsMutation,
  useInviteUserToProjectMutation,
  useDeleteNotificationMutation,
  useMarkNotificationAsReadMutation,
  useAcceptProjectInviteMutation,
  useGetCurrentUserNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useUpdateNotificationMutation,
  useLazyGetProjectUsersQuery
} = projectApiSlice;

export default projectApiSlice;