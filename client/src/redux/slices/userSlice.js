/**
 * Manages interactions with the backend API.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL;

export const userApiSlice = createApi({
    reducerPath: 'userApi',
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
            invalidatesTags: (result, error, arg) => {
                return result?.user ? ['User'] : [];
            }
        }),

        logout: builder.mutation({
            query: () => ({
                url: '/users/logout',
                method: 'POST',

            }),
            invalidatesTags: (result, error, arg) => {
                return result?.user ? ['User'] : [];
            }
        }),

        // Current user endpoint
        getCurrentUser: builder.query({
            query: () => '/users/me',
            providesTags: ['User']
        }),

        // Add to your userSlice.js if needed
        getAllUsers: builder.query({
            query: () => '/users',
            providesTags: ['User']
        }),


    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useGetUsersByProjectQuery,
    useGetAllUsersQuery,

} = userApiSlice;

export default userApiSlice;