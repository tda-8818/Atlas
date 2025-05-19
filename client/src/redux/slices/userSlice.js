/**
 * Manages interactions with the backend API, specifically user related controllers.
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
        signup: builder.mutation({ // Add the signup mutation
            query: (credentials) => ({
              url: '/users/signup',
              method: 'POST',
              body: credentials,
            }),
            // No invalidatesTags needed here as we're redirecting after signup
        }),

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



        // Add the updatePassword mutation
        updatePassword: builder.mutation({
            query: (credentials) => ({
                url: 'settings',
                method: 'PUT',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),

        updateMe: builder.mutation({ // For name/email
            query: (userData) => ({
              url: '/users/me',
              method: 'PUT',
              body: userData,
            }),
            invalidatesTags: ['User'],
          }),


        updateProfilePic: builder.mutation({
            query: (formData) => ({
                url: '/users/profile-pic',
                method: 'PUT',
                body: formData,
                formData: true, 
            }),
            invalidatesTags: ['User'],
        }),

        
    }),
});

export const {
    useSignupMutation,
    useLoginMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useGetAllUsersQuery,
    useUpdatePasswordMutation,
    useUpdateProfilePicMutation,
    useUpdateMeMutation

} = userApiSlice;

export default userApiSlice;