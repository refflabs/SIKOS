function requireEnv(key) {
  const value = import.meta.env[key]
  if (!value) {
    console.error(`[config] Missing required environment variable: ${key}`)
  }
  return value ?? ''
}

export const env = {
  apiUrl: requireEnv('VITE_API_URL'),
  socketUrl: requireEnv('VITE_SOCKET_URL'),
  appUrl: requireEnv('VITE_APP_URL'),
}

export function assertEnv() {
  if (!env.apiUrl) {
    throw new Error('VITE_API_URL is not defined. Copy .env.example to .env')
  }
}
