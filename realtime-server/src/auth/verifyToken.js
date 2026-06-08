import config from '../config.js'

/**
 * Validate Sanctum Bearer token against Laravel /api/me
 * @returns {Promise<{ id: number, role: string, email: string, name: string } | null>}
 */
export async function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return null
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(`${config.laravelApiUrl}/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })

    if (!res.ok) {
      return null
    }

    const user = await res.json()
    if (!user?.id) {
      return null
    }

    return {
      id: user.id,
      role: user.role || 'user',
      email: user.email,
      name: user.name,
    }
  } catch (err) {
    console.error('[realtime] Token verification failed:', err.message)
    return null
  } finally {
    clearTimeout(timeout)
  }
}
