import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const sprintApi = createApi({
    reducerPath: 'sprintApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseUrl}/api/sprints`,
        credentials: 'include'
    }),
    tagTypes: ['Sprint'],
    endpoints: (builder) => ({
        // Get all sprints for a project
        getProjectSprints: builder.query({
            query: (projectId) => `/project/${projectId}`,
            providesTags: (result, error, projectId) =>
                result
                    ? [...result.map(({ _id }) => ({ type: 'Sprint', id: _id })), { type: 'Sprint', id: 'LIST' }]
                    : [{ type: 'Sprint', id: 'LIST' }]
        }),

        // Get a single sprint with its tasks
        getSprint: builder.query({
            query: (sprintId) => `/${sprintId}`,
            providesTags: (result, error, sprintId) => [{ type: 'Sprint', id: sprintId }]
        }),

        // Get sprint statistics
        getSprintStats: builder.query({
            query: (sprintId) => `/${sprintId}/stats`,
            providesTags: (result, error, sprintId) => [{ type: 'Sprint', id: `${sprintId}-stats` }]
        }),

        // Create a new sprint
        createSprint: builder.mutation({
            query: ({ projectId, ...sprint }) => ({
                url: `/project/${projectId}`,
                method: 'POST',
                body: sprint
            }),
            invalidatesTags: [{ type: 'Sprint', id: 'LIST' }]
        }),

        // Update a sprint
        updateSprint: builder.mutation({
            query: ({ sprintId, ...sprint }) => ({
                url: `/${sprintId}`,
                method: 'PUT',
                body: sprint
            }),
            invalidatesTags: (result, error, { sprintId }) => [
                { type: 'Sprint', id: sprintId },
                { type: 'Sprint', id: 'LIST' },
                { type: 'Sprint', id: `${sprintId}-stats` }
            ]
        }),

        // Delete a sprint
        deleteSprint: builder.mutation({
            query: (sprintId) => ({
                url: `/${sprintId}`,
                method: 'DELETE'
            }),
            invalidatesTags: [{ type: 'Sprint', id: 'LIST' }]
        }),

        // Start a sprint
        startSprint: builder.mutation({
            query: (sprintId) => ({
                url: `/${sprintId}/start`,
                method: 'POST'
            }),
            invalidatesTags: (result, error, sprintId) => [
                { type: 'Sprint', id: sprintId },
                { type: 'Sprint', id: 'LIST' }
            ]
        }),

        // Complete a sprint
        completeSprint: builder.mutation({
            query: (sprintId) => ({
                url: `/${sprintId}/complete`,
                method: 'POST'
            }),
            invalidatesTags: (result, error, sprintId) => [
                { type: 'Sprint', id: sprintId },
                { type: 'Sprint', id: 'LIST' },
                { type: 'Sprint', id: `${sprintId}-stats` }
            ]
        })
    })
});

export const {
    useGetProjectSprintsQuery,
    useGetSprintQuery,
    useGetSprintStatsQuery,
    useCreateSprintMutation,
    useUpdateSprintMutation,
    useDeleteSprintMutation,
    useStartSprintMutation,
    useCompleteSprintMutation
} = sprintApi;
