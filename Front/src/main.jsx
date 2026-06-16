import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './app/App.jsx'
import './styles/index.css'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { assertEnv } from './config/env'

try {
  assertEnv()
} catch (e) {
  console.error(e.message)
}

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocketProvider>
        <App />
        <Toaster position="top-right" richColors closeButton />
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>,
)

