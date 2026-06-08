/** @readonly Realtime event contract — keep in sync with Backend/config/realtime.php */
export const Events = {
  BOOKING_CREATED: 'booking:created',
  BOOKING_STATUS_CHANGED: 'booking:status_changed',
  BOOKINGS_UPDATED: 'bookings:updated',
  ROOM_UPDATED: 'room:updated',
  SERVER_ERROR: 'server:error',
  CLIENT_SUBSCRIBE: 'client:subscribe',
}

export const Channels = {
  PUBLIC: 'public',
  ADMIN: 'admin',
}

export const ENVELOPE_VERSION = 1

export function createEnvelope(type, payload) {
  return {
    type,
    payload,
    meta: {
      version: ENVELOPE_VERSION,
      timestamp: new Date().toISOString(),
    },
  }
}
