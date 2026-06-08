import { queryClient } from '../lib/queryClient'
import { roomKeys, bookingKeys } from '../hooks/queries'
import { RealtimeEvents, parseEnvelope } from './events'
import { getStoredUser } from '../api/auth'
import { toast } from 'sonner'

function onBookingCreated(envelope) {
  const { payload } = parseEnvelope(envelope)
  queryClient.invalidateQueries({ queryKey: bookingKeys.all })
  queryClient.invalidateQueries({ queryKey: roomKeys.all })

  const user = getStoredUser()
  if (user?.role === 'admin') {
    toast.success('Booking baru masuk', {
      description: `${payload?.user_name || 'Penghuni'} — ${payload?.room_name || 'Kamar'}`,
      duration: 6000,
    })
  }
}

function onBookingStatusChanged() {
  queryClient.invalidateQueries({ queryKey: bookingKeys.all })
}

function onBookingsUpdated(envelope) {
  const { payload } = parseEnvelope(envelope)
  queryClient.invalidateQueries({ queryKey: bookingKeys.all })

  if (payload?.pending != null) {
    queryClient.setQueryData(['realtime', 'booking-stats'], payload)
  }
}

function onRoomUpdated(envelope) {
  const { payload } = parseEnvelope(envelope)
  const room = payload

  if (room?.id) {
    queryClient.setQueryData(roomKeys.detail(String(room.id)), room)
  }
  queryClient.invalidateQueries({ queryKey: roomKeys.all })
}

/**
 * Register all server event listeners on a socket instance
 * @param {import('socket.io-client').Socket} socket
 */
export function registerRealtimeHandlers(socket) {
  socket.on(RealtimeEvents.BOOKING_CREATED, onBookingCreated)
  socket.on(RealtimeEvents.BOOKING_STATUS_CHANGED, onBookingStatusChanged)
  socket.on(RealtimeEvents.BOOKINGS_UPDATED, onBookingsUpdated)
  socket.on(RealtimeEvents.ROOM_UPDATED, onRoomUpdated)

  socket.on(RealtimeEvents.SERVER_ERROR, (envelope) => {
    const { payload } = parseEnvelope(envelope)
    console.error('[realtime] Server error:', payload)
  })
}

export function unregisterRealtimeHandlers(socket) {
  Object.values(RealtimeEvents).forEach((event) => {
    if (event !== RealtimeEvents.CLIENT_SUBSCRIBE) {
      socket.off(event)
    }
  })
}
