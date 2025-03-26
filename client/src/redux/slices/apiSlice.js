/**
 * Manages interactions with the backend API.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = "http://localhost:5000/api";

const baseQuery = fetchBaseQuery({ baseUrl: API_URL }); // Base URL for API requests


export const apiSlice = createApi({
    baseQuery,
    tagTypes: [],
    endpoints: (builder) => ({}),
    reducerPath: 'api',
    
    // Define the endpoints for the API
    endpoints: (builder) => ({
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
    useGetTasksQuery,
    useAddTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
} = apiSlice;

export default apiSlice;