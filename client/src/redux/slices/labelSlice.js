import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || '/';

export const labelApi = createApi({
  reducerPath: 'labelApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/labels`,
    credentials: 'include',
  }),
  tagTypes: ['Label'],
  endpoints: (builder) => ({
    // Get all labels for a project
    getProjectLabels: builder.query({
      query: (projectId) => `/project/${projectId}`,
      providesTags: (result, error, projectId) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Label', id: _id })),
              { type: 'Label', id: `PROJECT-${projectId}` },
            ]
          : [{ type: 'Label', id: `PROJECT-${projectId}` }],
    }),

    // Create a new label
    createLabel: builder.mutation({
      query: ({ projectId, ...body }) => ({
        url: `/project/${projectId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Label', id: `PROJECT-${projectId}` },
      ],
    }),

    // Update a label
    updateLabel: builder.mutation({
      query: ({ labelId, ...body }) => ({
        url: `/${labelId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { labelId }) => [
        { type: 'Label', id: labelId },
      ],
    }),

    // Delete a label
    deleteLabel: builder.mutation({
      query: (labelId) => ({
        url: `/${labelId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, labelId) => [
        { type: 'Label', id: labelId },
      ],
    }),
  }),
});

export const {
  useGetProjectLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
} = labelApi;
