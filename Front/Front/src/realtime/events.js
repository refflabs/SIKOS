/** @readonly Keep in sync with realtime-server/src/events.js and Backend/config/realtime.php */
export const RealtimeEvents = {
  BOOKING_CREATED: 'booking:created',
  BOOKING_STATUS_CHANGED: 'booking:status_changed',
  BOOKINGS_UPDATED: 'bookings:updated',
  ROOM_UPDATED: 'room:updated',
  SERVER_ERROR: 'server:error',
  CLIENT_SUBSCRIBE: 'client:subscribe',
  CHAT_SEND_MESSAGE: 'chat:send_message',
  CHAT_MESSAGE_RECEIVED: 'chat:message_received',
  CHAT_GET_HISTORY: 'chat:get_history',
  CHAT_HISTORY: 'chat:history',
  CHAT_GET_THREADS: 'chat:get_threads',
  CHAT_THREADS: 'chat:threads',
  CHAT_THREAD_UPDATED: 'chat:thread_updated',
  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  // Read receipts
  CHAT_MESSAGE_READ: 'chat:message_read',
  CHAT_MARK_READ: 'chat:mark_read',
}

export const RealtimeChannels = {
  PUBLIC: 'public',
  ADMIN: 'admin',
}

/** @typedef {{ type: string, payload: object, meta?: { version: number, timestamp: string } }} RealtimeEnvelope */

export function isEnvelope(data) {
  return data && typeof data === 'object' && typeof data.type === 'string' && 'payload' in data
}

export function parseEnvelope(data) {
  if (isEnvelope(data)) {
    return data
  }
  return { type: null, payload: data, meta: null }
}
