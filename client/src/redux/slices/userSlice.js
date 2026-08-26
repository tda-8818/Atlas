/**
 * Manages interactions with the backend API, specifically user related controllers.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || '/';

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
    tagTypes: ['User', 'ApiKey'],
    endpoints: (builder) => ({
        // User endpoints
        signup: builder.mutation({ // Add the signup mutation
            query: (credentials) => ({
              url: 'api/users/signup',
              method: 'POST',
              body: credentials,
            }),
            // No invalidatesTags needed here as we're redirecting after signup
        }),

        login: builder.mutation({
            query: (credentials) => ({
                url: 'api/users/login',
                method: 'POST',
                body: credentials
            }),
            invalidatesTags: (result, error, arg) => {
                return result?.user ? ['User'] : [];
            }
        }),

        logout: builder.mutation({
            query: () => ({
                url: 'api/users/logout',
                method: 'POST',

            }),
            invalidatesTags: (result, error, arg) => {
                return result?.user ? ['User'] : [];
            }
        }),

        // Current user endpoint
        getCurrentUser: builder.query({
            query: () => 'api/users/me',
            providesTags: ['User']
        }),

        // Add to your userSlice.js if needed
        getAllUsers: builder.query({
            query: () => 'api/users',
            providesTags: ['User']
        }),



        // Add the updatePassword mutation
        updatePassword: builder.mutation({
            query: (credentials) => ({
                url: 'api/settings',
                method: 'PUT',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),

        updateMe: builder.mutation({ // For name/email
            query: (userData) => ({
              url: 'api/users/me',
              method: 'PUT',
              body: userData,
            }),
            invalidatesTags: ['User'],
          }),


        updateProfilePic: builder.mutation({
            query: (formData) => ({
                url: 'api/users/profile-pic',
                method: 'PUT',
                body: formData,
                formData: true,
            }),
            invalidatesTags: ['User'],
        }),

        resendVerificationEmail: builder.mutation({
            query: () => ({
                url: 'api/users/resend-verification',
                method: 'POST',
            }),
        }),

        getApiKeys: builder.query({
            query: () => 'api/users/api-keys',
            providesTags: ['ApiKey'],
        }),

        createApiKey: builder.mutation({
            query: (body) => ({
                url: 'api/users/api-keys',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ApiKey'],
        }),

        revokeApiKey: builder.mutation({
            query: (keyId) => ({
                url: `api/users/api-keys/${keyId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ApiKey'],
        }),

        forgotPassword: builder.mutation({
            query: (body) => ({
                url: 'api/users/forgot-password',
                method: 'POST',
                body,
            }),
        }),

        resetPassword: builder.mutation({
            query: ({ token, password }) => ({
                url: `api/users/reset-password/${token}`,
                method: 'POST',
                body: { password },
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
    useUpdateMeMutation,
    useResendVerificationEmailMutation,
    useGetApiKeysQuery,
    useCreateApiKeyMutation,
    useRevokeApiKeyMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,

} = userApiSlice;

export default userApiSlice;