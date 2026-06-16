import { useState } from 'react'
import { Button } from '../components/Button'
import { useAuth } from '../../context/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (form.password !== form.password_confirmation) {
      setError('Password dan konfirmasi password tidak cocok.')
      setLoading(false)
      return
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      setSuccess(true)
      // Redirect after brief success message
      setTimeout(() => {
        window.location.href = '/'
      }, 1200)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.email?.[0] ||
          err.response?.data?.errors?.password?.[0] ||
          'Pendaftaran gagal. Periksa kembali data Anda.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200">
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-foreground">Pendaftaran berhasil!</h2>
        <p className="text-sm text-muted-foreground">Mengalihkan ke beranda…</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-xl font-bold tracking-tight text-center mb-1">Daftar akun baru</h1>
      <p className="text-subtitle text-sm text-center mb-8">
        Buat akun untuk mulai booking kamar kost.
      </p>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className="text-label block mb-2">
            Nama lengkap
          </label>
          <input
            id="reg-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Nama lengkap"
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="text-label block mb-2">
            Email
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="input-field"
            placeholder="email@contoh.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="reg-phone" className="text-label block mb-2">
            Nomor WhatsApp
          </label>
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="input-field"
            placeholder="08xxxxxxxxxx"
            autoComplete="tel"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-password" className="text-label block mb-2">
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Min. 8 karakter"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="reg-password-confirm" className="text-label block mb-2">
              Ulangi password
            </label>
            <input
              id="reg-password-confirm"
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              className="input-field"
              placeholder="Ulangi password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
          {loading ? 'Mendaftarkan…' : 'Daftar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <a href="/login" className="font-semibold text-foreground hover:underline">
          Masuk
        </a>
      </p>
    </>
  )
}
