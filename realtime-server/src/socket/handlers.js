import { Channels, Events } from '../events.js'
import { getChatHistory, addMessage, getChatThreads } from './chatStore.js'

const ALLOWED_CHANNELS = new Set([Channels.PUBLIC, Channels.ADMIN])

export function registerSocketHandlers(io, socket) {
  // Every client receives public room availability updates
  socket.join(Channels.PUBLIC)

  // If user is logged in, join their user-specific room
  if (socket.data.user?.id) {
    socket.join(`user:${socket.data.user.id}`)
  }

  socket.on(Events.CLIENT_SUBSCRIBE, (data, ack) => {
    const channels = Array.isArray(data?.channels) ? data.channels : []
    const joined = []
    const errors = []

    for (const channel of channels) {
      if (!ALLOWED_CHANNELS.has(channel)) {
        errors.push(`Unknown channel: ${channel}`)
        continue
      }

      if (channel === Channels.ADMIN) {
        if (socket.data.user?.role !== 'admin') {
          errors.push('Forbidden: admin channel requires admin role')
          continue
        }
      }

      socket.join(channel)
      joined.push(channel)
    }

    const response = { ok: errors.length === 0, joined, errors }
    if (typeof ack === 'function') {
      ack(response)
    }
  })

  // Handle chat message sending
  socket.on(Events.CHAT_SEND_MESSAGE, (data, ack) => {
    if (!socket.data.user) {
      return socket.emit(Events.SERVER_ERROR, { message: 'Unauthorized: Harap login terlebih dahulu.' })
    }

    const text = data?.text?.trim()
    if (!text) return

    const user = socket.data.user
    let msg

    if (user.role === 'admin') {
      const targetUserId = Number(data?.userId)
      if (!targetUserId) {
        return socket.emit(Events.SERVER_ERROR, { message: 'Bad Request: Target userId diperlukan.' })
      }

      msg = {
        id: Math.random().toString(36).substring(2, 9),
        userId: targetUserId,
        senderId: user.id,
        senderName: user.name,
        role: 'admin',
        text,
        timestamp: new Date().toISOString(),
      }

      addMessage(targetUserId, msg)

      // Broadcast to target user's room
      io.to(`user:${targetUserId}`).emit(Events.CHAT_MESSAGE_RECEIVED, msg)
      // Broadcast to admin channel to sync other admin sessions
      io.to(Channels.ADMIN).emit(Events.CHAT_MESSAGE_RECEIVED, msg)
      // Broadcast thread updates to admin
      io.to(Channels.ADMIN).emit(Events.CHAT_THREAD_UPDATED, getChatThreads())
    } else {
      const tenantId = user.id
      msg = {
        id: Math.random().toString(36).substring(2, 9),
        userId: tenantId,
        senderId: tenantId,
        senderName: user.name,
        role: 'user',
        text,
        timestamp: new Date().toISOString(),
      }

      addMessage(tenantId, msg)

      // Broadcast to user's room (sync multiple tabs)
      io.to(`user:${tenantId}`).emit(Events.CHAT_MESSAGE_RECEIVED, msg)
      // Broadcast to admin channel
      io.to(Channels.ADMIN).emit(Events.CHAT_MESSAGE_RECEIVED, msg)
      // Broadcast thread updates to admin
      io.to(Channels.ADMIN).emit(Events.CHAT_THREAD_UPDATED, getChatThreads())
    }

    if (typeof ack === 'function') {
      ack({ ok: true, message: msg })
    }
  })

  // Handle retrieving chat history
  socket.on(Events.CHAT_GET_HISTORY, (data, ack) => {
    if (!socket.data.user) {
      return socket.emit(Events.SERVER_ERROR, { message: 'Unauthorized' })
    }

    const user = socket.data.user
    const targetUserId = (user.role === 'admin' && data?.userId) ? Number(data.userId) : user.id
    const history = getChatHistory(targetUserId)

    if (typeof ack === 'function') {
      ack(history)
    } else {
      socket.emit(Events.CHAT_HISTORY, { userId: targetUserId, history })
    }
  })

  // Handle retrieving chat threads list (Admin only)
  socket.on(Events.CHAT_GET_THREADS, (data, ack) => {
    if (socket.data.user?.role !== 'admin') {
      return socket.emit(Events.SERVER_ERROR, { message: 'Forbidden: Admin only.' })
    }

    const threads = getChatThreads()
    if (typeof ack === 'function') {
      ack(threads)
    } else {
      socket.emit(Events.CHAT_THREADS, threads)
    }
  })

  socket.on('disconnect', (reason) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[realtime] Client disconnected (${socket.id}): ${reason}`)
    }
  })
}
