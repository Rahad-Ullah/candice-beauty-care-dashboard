import { baseApi } from '../../api/baseApi';

const bookingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllBookings: builder.query({
            query: () => {
                return {
                    url: `/service`,
                    method: 'GET',
                };
            },
            providesTags: ['Bookings', 'Booking'],
        }),
        getSingleBooking: builder.query({
            query: ({ id }) => {
                return {
                    url: `/service/${id}`,
                    method: 'GET',
                };
            },
            providesTags: ['Booking'],
        }),
        reassignOrder: builder.mutation({
            query: ({ bookingId, artistId }) => {
                return {
                    url: `/service/reassign-order/${bookingId}/${artistId}`,
                    method: 'PATCH',
                };
            },
            invalidatesTags: ['Booking', 'Bookings'],
        }),
    }),
});

export const { useGetAllBookingsQuery, useGetSingleBookingQuery, useReassignOrderMutation } = bookingApi;

