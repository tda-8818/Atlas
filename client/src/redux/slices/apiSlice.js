/**
 * Manages interactions with the backend API.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }
}); // Base URL for API requests

// error handling
//   const baseQueryWithReauth = async (args, api, extraOptions) => {
//     let result = await baseQuery(args, api, extraOptions);

//     if (result?.error?.status === 401) {
//       // Try to refresh token here if you implement refresh tokens
//     }
//     return result;
//   };

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Task'], // Define the tag types for cache invalidation
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
    useGetCurrentUserQuery,
    useGetTasksQuery,
    useAddTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
} = apiSlice;

export default apiSlice;