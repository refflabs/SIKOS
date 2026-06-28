import React from 'react'
import { ShieldAlert } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="rounded-full bg-rose-50 p-4 text-rose-600 border border-rose-100 mb-4">
            <ShieldAlert className="h-10 w-10 animate-pulse" />
          </div>
          <h2 className="text-lg font-extrabold text-stone-800">Ups, terjadi kesalahan sistem</h2>
          <p className="mt-2 max-w-md text-xs text-stone-500 font-medium">
            {this.state.error?.message || "Kesalahan tak terduga telah menghentikan aplikasi."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4.5 py-2.5 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-900 transition-colors cursor-pointer"
          >
            Muat Ulang Halaman
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
