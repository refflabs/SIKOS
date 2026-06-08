import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRooms, getRoomById } from '../api/rooms'
import { getBookings, createBooking } from '../api/bookings'

export const roomKeys = {
  all: ['rooms'],
  list: (params) => ['rooms', 'list', params],
  detail: (id) => ['rooms', 'detail', id],
}

export const bookingKeys = {
  all: ['bookings'],
}

export function useRoomsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => getRooms(params),
    ...options,
  })
}

export function useRoomQuery(id, options = {}) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => getRoomById(id),
    enabled: Boolean(id),
    ...options,
  })
}

export function useBookingsQuery(options = {}) {
  return useQuery({
    queryKey: bookingKeys.all,
    queryFn: getBookings,
    ...options,
  })
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}
