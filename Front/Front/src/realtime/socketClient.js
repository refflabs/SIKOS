import { io } from 'socket.io-client'
import { env } from '../config/env'
import { getStoredUser } from '../api/auth'
import { RealtimeChannels, RealtimeEvents } from './events'
import { registerRealtimeHandlers, unregisterRealtimeHandlers } from './handlers'

/** @typedef {'idle'|'connecting'|'connected'|'disconnected'|'reconnecting'|'error'} ConnectionStatus */

const RECONNECTION = {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  randomizationFactor: 0.5,
  timeout: 20000,
}

let socketInstance = null
/** @type {Set<(status: ConnectionStatus) => void>} */
const statusListeners = new Set()
/** @type {ConnectionStatus} */
let currentStatus = 'idle'

function setStatus(status) {
  if (currentStatus === status) return
  currentStatus = status
  statusListeners.forEach((fn) => fn(status))
}

export function getConnectionStatus() {
  return currentStatus
}

export function onConnectionStatusChange(listener) {
  statusListeners.add(listener)
  listener(currentStatus)
  return () => statusListeners.delete(listener)
}

function buildChannels() {
  const channels = [RealtimeChannels.PUBLIC]
  const user = getStoredUser()
  if (user?.role === 'admin') {
    channels.push(RealtimeChannels.ADMIN)
  }
  return channels
}

export function subscribeChannels(socket) {
  return new Promise((resolve) => {
    socket.emit(RealtimeEvents.CLIENT_SUBSCRIBE, { channels: buildChannels() }, (response) => {
      if (response?.errors?.length) {
        console.warn('[realtime] Subscribe warnings:', response.errors)
      }
      resolve(response)
    })
  })
}

export function getSocket() {
  if (!env.socketUrl) {
    return null
  }

  if (socketInstance) {
    return socketInstance
  }

  const token = localStorage.getItem('token')

  setStatus('connecting')

  socketInstance = io(env.socketUrl, {
    ...RECONNECTION,
    transports: ['websocket', 'polling'],
    auth: token ? { token } : {},
    autoConnect: true,
  })

  registerRealtimeHandlers(socketInstance)

  socketInstance.on('connect', async () => {
    setStatus('connected')
    await subscribeChannels(socketInstance)
    // Emit presence online setelah subscribe
    socketInstance.emit('presence:online')
  })

  socketInstance.io.on('reconnect_attempt', () => {
    setStatus('reconnecting')
  })

  socketInstance.io.on('reconnect', async () => {
    setStatus('connected')
    await subscribeChannels(socketInstance)
    socketInstance.emit('presence:online')
  })

  socketInstance.on('disconnect', (reason) => {
    // Hanya emit offline saat client sengaja disconnect (logout)
    if (reason === 'io client disconnect') {
      // offline akan dikirim sebelum disconnect via destroySocket
      setStatus('idle')
    } else {
      setStatus('disconnected')
    }
  })

  socketInstance.on('connect_error', (err) => {
    console.error('[realtime] Connection error:', err.message)
    setStatus('error')
  })

  return socketInstance
}

/**
 * Reconnect with fresh auth token (after login/logout)
 * Destroy old socket and create a new one so the new token is used in handshake
 */
export function refreshSocketAuth() {
  if (!env.socketUrl) return

  // Destroy existing socket cleanly
  if (socketInstance) {
    unregisterRealtimeHandlers(socketInstance)
    socketInstance.removeAllListeners()
    socketInstance.disconnect()
    socketInstance = null
  }

  // Small delay to let OS release the connection, then create fresh socket
  setStatus('connecting')
  setTimeout(() => {
    getSocket()
  }, 300)
}

export function destroySocket() {
  if (!socketInstance) return
  // Beritahu server user offline sebelum disconnect
  if (socketInstance.connected) {
    socketInstance.emit('presence:offline')
  }
  unregisterRealtimeHandlers(socketInstance)
  socketInstance.removeAllListeners()
  socketInstance.disconnect()
  socketInstance = null
  setStatus('idle')
}
