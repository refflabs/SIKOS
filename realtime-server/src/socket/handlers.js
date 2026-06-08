import { Channels, Events } from '../events.js'

const ALLOWED_CHANNELS = new Set([Channels.PUBLIC, Channels.ADMIN])

export function registerSocketHandlers(io, socket) {
  // Every client receives public room availability updates
  socket.join(Channels.PUBLIC)

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

  socket.on('disconnect', (reason) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[realtime] Client disconnected (${socket.id}): ${reason}`)
    }
  })
}
