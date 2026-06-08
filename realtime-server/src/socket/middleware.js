import { verifyToken } from '../auth/verifyToken.js'

/**
 * Optional auth — anonymous clients may connect but cannot join admin channel
 */
export function authMiddleware(socket, next) {
  const token = socket.handshake.auth?.token

  if (!token) {
    socket.data.user = null
    return next()
  }

  verifyToken(token)
    .then((user) => {
      if (!user) {
        return next(new Error('Invalid or expired token'))
      }
      socket.data.user = user
      next()
    })
    .catch(() => next(new Error('Authentication failed')))
}
