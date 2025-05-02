/**
 * Manages interactions with the backend API.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = "http://localhost:5001/api";

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        credentials: 'include',
    }),
    prepareHeaders: (headers, { getState }) => {
        // Force cookies to be sent (even for cross-origin if needed)
        headers.set('Accept', 'application/json');
        headers.set('Cache-Control', 'no-cache');
        return headers;
    },
    endpoints: (builder) => ({
        // User endpoints
        login: builder.mutation({
            query: (credentials) => ({
                url: '/users/login',
                method: 'POST',
                body: credentials
            }),
            invalidatesTags: ['User']
        }),

        logout: builder.mutation({
            query: () => ({
                url: '/users/logout',
                method: 'POST',
            }),
        }),

        // Current user endpoint
        getCurrentUser: builder.query({
            query: () => '/users/me',
            providesTags: ['User']
        }),

        // Task endpoints
        getTasks: builder.query({
            query: () => '/tasks',
        }),
        addTask: builder.mutation({
            query: (newTask) => ({
                url: '/tasks',
                method: 'POST',
                body: newTask,
            }),
        }),
        updateTask: builder.mutation({
            query: ({ id, ...updatedTask }) => ({
                url: `/tasks/${id}`,
                method: 'PUT',
                body: updatedTask,
            }),
        }),
        deleteTask: builder.mutation({
            query: (id) => ({
                url: `/tasks/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useGetTasksQuery,
    useAddTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
    useGetProjectsQuery,

} = apiSlice;

export default apiSlice;