import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../app/components/Button'

export function QueryError({ message = 'Gagal memuat data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-border bg-surface-warm">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
        <AlertCircle className="h-6 w-6" />
      </span>
      <p className="text-sm font-medium text-foreground mb-1">Terjadi kesalahan</p>
      <p className="text-subtitle text-sm mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="md" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Coba lagi
        </Button>
      )}
    </div>
  )
}
