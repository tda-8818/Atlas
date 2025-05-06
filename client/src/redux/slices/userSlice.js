/**
 * Manages interactions with the backend API.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL;

export const userApiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        credentials: 'include',
    }),
    prepareHeaders: (headers) => {
        headers.set('Accept', 'application/json');
        return headers;
    },
    tagTypes: ['User'], 
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
            invalidatesTags: ['User']
        }),

        // Current user endpoint
        getCurrentUser: builder.query({
            query: () => '/users/me',
            providesTags: ['User']
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useGetCurrentUserQuery

} = userApiSlice;

export default userApiSlice;