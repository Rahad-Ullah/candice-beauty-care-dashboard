import { baseApi } from '../../api/baseApi';

const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSingleUser: builder.query({
            query: ({ id }) => {
                return {
                    url: `/user/user/${id}`,
                    method: 'GET',
                };
            },
            providesTags: ['User'],
        }),
        getAllUsers: builder.query({
            query: ({ query }) => {
                return {
                    url: `/user${query}`,
                    method: 'GET',
                };
            },
            providesTags: ['Users'],
        }),
        updateUser: builder.mutation({
            query: ({ payload, id }) => {
                return {
                    url: `/user/user/${id}`,
                    method: 'PATCH',
                    body: payload,
                };
            },
            invalidatesTags: ['Profile', 'Users', 'User'],
        }),
    }),
});

export const { useUpdateUserMutation, useGetSingleUserQuery, useGetAllUsersQuery, useLazyGetAllUsersQuery } = userApi;
