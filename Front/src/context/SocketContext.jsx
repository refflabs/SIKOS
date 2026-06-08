import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  getSocket,
  getConnectionStatus,
  onConnectionStatusChange,
  refreshSocketAuth,
  subscribeChannels,
} from '../realtime/socketClient'
import { env } from '../config/env'

/** @typedef {'idle'|'connecting'|'connected'|'disconnected'|'reconnecting'|'error'} ConnectionStatus */

const SocketContext = createContext({
  /** @type {ConnectionStatus} */
  status: 'idle',
  connected: false,
  refreshSubscriptions: async () => {},
  refreshAuth: () => {},
})

export function SocketProvider({ children }) {
  const [status, setStatus] = useState(getConnectionStatus)

  useEffect(() => {
    if (!env.socketUrl) {
      console.warn('[realtime] VITE_SOCKET_URL not set — real-time disabled')
      return undefined
    }

    getSocket()

    const unsubscribe = onConnectionStatusChange(setStatus)

    const onAuthChanged = () => {
      refreshSocketAuth()
    }

    window.addEventListener('sikos:auth-changed', onAuthChanged)

    return () => {
      unsubscribe()
      window.removeEventListener('sikos:auth-changed', onAuthChanged)
    }
  }, [])

  const refreshSubscriptions = useCallback(async () => {
    const socket = getSocket()
    if (socket?.connected) {
      await subscribeChannels(socket)
    }
  }, [])

  const refreshAuth = useCallback(() => {
    refreshSocketAuth()
  }, [])

  const connected = status === 'connected'

  return (
    <SocketContext.Provider
      value={{
        status,
        connected,
        refreshSubscriptions,
        refreshAuth,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
