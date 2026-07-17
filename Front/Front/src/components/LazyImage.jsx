import { useState } from 'react'

export function LazyImage({ src, alt, className = '', wrapperClassName = '' }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className={`relative overflow-hidden bg-slate-200 ${wrapperClassName}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 to-slate-100" />
      )}
      <img
        src={error ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=60' : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  )
}
