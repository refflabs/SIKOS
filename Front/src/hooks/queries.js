import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom } from '../api/rooms'
import { getBookings, createBooking, updateBookingStatus, deleteBooking, requestBookingRenewal, handleBookingRenewalAction } from '../api/bookings'
import { getUsers, getUserById, updateUser, deleteUser } from '../api/users'
import { getPaymentSummary, getPayments, verifyPayment } from '../api/payments'

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

export function useUpdateBookingStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}

export function useDeleteBookingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}

export function useRequestBookingRenewalMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, durationMonths }) => requestBookingRenewal(id, durationMonths),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    },
  })
}

export function useHandleBookingRenewalActionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }) => handleBookingRenewalAction(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}

export function useCreateRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}

export function useUpdateRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateRoom(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(variables.id) })
    },
  })
}

export function useDeleteRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}

export const userKeys = {
  all: ['users'],
  list: (params) => ['users', 'list', params],
  detail: (id) => ['users', 'detail', id],
}

export function useUsersQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
    ...options,
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export const paymentKeys = {
  all: ['payments'],
  summary: () => ['payments', 'summary'],
  list: (params) => ['payments', 'list', params],
}

export function usePaymentSummaryQuery(options = {}) {
  return useQuery({
    queryKey: paymentKeys.summary(),
    queryFn: getPaymentSummary,
    ...options,
  })
}

export function usePaymentsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => getPayments(params),
    ...options,
  })
}

export function useVerifyPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }) => verifyPayment(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}



