import { useEffect, useState } from 'react'
import { GOOGLE_CLIENT_ID } from '../constants'
import { toast } from 'sonner'

export function useGoogleAuth({ buttonId, isDark, mode = 'masuk', isEnabled = true, setError, setLoading }) {
  const handleGoogleLogin = async (response) => {
    if (setError) setError('')
    if (setLoading) setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || `Gagal ${mode} menggunakan Google.`)
      }

      const data = await res.json()
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.dispatchEvent(new CustomEvent('sikos:auth-changed'))

      toast.success(`Berhasil ${mode} menggunakan Google!`)
      window.location.href = data.user?.role === 'admin' ? '/dashboard' : '/'
    } catch (err) {
      if (setError) setError(err.message)
    } finally {
      if (setLoading) setLoading(false)
    }
  }

  useEffect(() => {
    if (!isEnabled) return

    const initGoogle = () => {
      /* global google */
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin
        })
        
        const btnElement = document.getElementById(buttonId)
        if (btnElement) {
          google.accounts.id.renderButton(btnElement, {
            theme: isDark ? "filled_black" : "outline",
            size: "large",
            width: 320,
            text: "signin_with",
            shape: "pill"
          })
        }
      }
    }

    if (typeof google !== 'undefined') {
      initGoogle()
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (script) {
        script.addEventListener('load', initGoogle)
      }
    }
  }, [buttonId, isDark, isEnabled])

  return {}
}
