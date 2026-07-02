import { useMemo } from 'react'
import { ArrowDownCircle, ArrowUpCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { formatPrice } from '../../api/roomUtils'

/**
 * LedgerView — Lightweight accounting ledger (frontend-computed)
 *
 * Debit  = tagihan booking (room.price × duration_months)
 * Credit = pembayaran terkonfirmasi (status = 'confirmed' / 'approved')
 * Balance = running saldo outstanding
 */
export function LedgerView({ bookings = [] }) {
  const rows = useMemo(() => {
    const result = []
    let runningBalance = 0

    // Sort by check_in date ascending
    const sorted = [...bookings].sort(
      (a, b) => new Date(a.check_in) - new Date(b.check_in)
    )

    for (const b of sorted) {
      const price = Number(b.room?.price || 0)
      const duration = Number(b.duration_months || 1)
      const charge = price * duration

      // ── Debit row (tagihan) ──
      runningBalance += charge
      result.push({
        id: `debit-${b.id}`,
        date: b.check_in,
        description: `Sewa ${b.room?.name || 'Kamar'} · ${duration} bulan`,
        type: 'debit',
        debit: charge,
        credit: 0,
        balance: runningBalance,
        status: b.status,
      })

      // ── Credit row (bayar terkonfirmasi) ──
      const isPaid = ['confirmed', 'approved', 'active'].includes(b.status)
      if (isPaid && charge > 0) {
        runningBalance -= charge
        result.push({
          id: `credit-${b.id}`,
          date: b.updated_at || b.check_in,
          description: `Pembayaran diterima — ${b.room?.name || 'Kamar'}`,
          type: 'credit',
          debit: 0,
          credit: charge,
          balance: runningBalance,
          status: b.status,
        })
      }
    }
    return result
  }, [bookings])

  const totalDebit = rows.filter(r => r.type === 'debit').reduce((s, r) => s + r.debit, 0)
  const totalCredit = rows.filter(r => r.type === 'credit').reduce((s, r) => s + r.credit, 0)
  const outstanding = totalDebit - totalCredit

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Belum ada data transaksi.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-xl p-4 border"
          style={{ background: 'rgba(107,143,113,0.06)', borderColor: 'var(--border)' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>
            Total Tagihan
          </p>
          <p className="text-base font-extrabold" style={{ color: 'var(--foreground)' }}>
            {formatPrice(totalDebit)}
          </p>
        </div>
        <div
          className="rounded-xl p-4 border"
          style={{ background: 'rgba(107,143,113,0.06)', borderColor: 'var(--border)' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>
            Total Dibayar
          </p>
          <p className="text-base font-extrabold" style={{ color: 'var(--primary)' }}>
            {formatPrice(totalCredit)}
          </p>
        </div>
        <div
          className="rounded-xl p-4 border"
          style={{
            background: outstanding > 0 ? 'rgba(220,38,38,0.06)' : 'rgba(34,197,94,0.06)',
            borderColor: outstanding > 0 ? 'rgba(220,38,38,0.15)' : 'rgba(34,197,94,0.15)',
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>
            {outstanding > 0 ? 'Belum Lunas' : 'Saldo'}
          </p>
          <p className="text-base font-extrabold" style={{ color: outstanding > 0 ? '#dc2626' : 'var(--primary)' }}>
            {formatPrice(outstanding)}
          </p>
          {outstanding === 0 && (
            <p className="text-[10px] font-semibold" style={{ color: 'var(--primary)' }}>✓ Lunas</p>
          )}
        </div>
      </div>

      {/* Ledger table */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-[120px_1fr_120px_120px_120px] gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-wider border-b"
          style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          <span>Tanggal</span>
          <span>Keterangan</span>
          <span className="text-right text-red-500">Debit (Tagihan)</span>
          <span className="text-right" style={{ color: 'var(--primary)' }}>Kredit (Bayar)</span>
          <span className="text-right">Saldo</span>
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {rows.map((row, i) => (
            <div
              key={row.id}
              className="grid grid-cols-[120px_1fr_120px_120px_120px] gap-3 px-4 py-3 text-xs items-center transition-colors duration-150"
              style={{ background: i % 2 === 0 ? 'transparent' : 'var(--secondary)' }}
            >
              {/* Date */}
              <span style={{ color: 'var(--muted-foreground)' }}>
                {row.date ? new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </span>

              {/* Description */}
              <div className="flex items-center gap-2 min-w-0">
                {row.type === 'debit' ? (
                  <ArrowDownCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                ) : (
                  <ArrowUpCircle className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                )}
                <span className="truncate font-medium" style={{ color: 'var(--foreground)' }}>
                  {row.description}
                </span>
              </div>

              {/* Debit */}
              <span className="text-right font-semibold" style={{ color: row.debit > 0 ? '#dc2626' : 'var(--muted-foreground)' }}>
                {row.debit > 0 ? formatPrice(row.debit) : '—'}
              </span>

              {/* Credit */}
              <span className="text-right font-semibold" style={{ color: row.credit > 0 ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                {row.credit > 0 ? formatPrice(row.credit) : '—'}
              </span>

              {/* Running balance */}
              <div className="text-right">
                <span
                  className="font-bold"
                  style={{ color: row.balance === 0 ? 'var(--primary)' : row.balance > 0 ? '#d97706' : 'var(--foreground)' }}
                >
                  {formatPrice(Math.abs(row.balance))}
                </span>
                {row.balance === 0 && (
                  <span
                    className="ml-1 text-[9px] font-bold px-1 rounded"
                    style={{ background: 'rgba(107,143,113,0.15)', color: 'var(--primary)' }}
                  >
                    LUNAS
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer total */}
        <div
          className="grid grid-cols-[120px_1fr_120px_120px_120px] gap-3 px-4 py-3 border-t text-xs font-bold"
          style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <span></span>
          <span>Total</span>
          <span className="text-right text-red-600">{formatPrice(totalDebit)}</span>
          <span className="text-right" style={{ color: 'var(--primary)' }}>{formatPrice(totalCredit)}</span>
          <span className="text-right" style={{ color: outstanding > 0 ? '#d97706' : 'var(--primary)' }}>
            {formatPrice(outstanding)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
        <span className="flex items-center gap-1.5">
          <ArrowDownCircle className="h-3.5 w-3.5 text-red-500" /> Debit = tagihan sewa
        </span>
        <span className="flex items-center gap-1.5">
          <ArrowUpCircle className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} /> Kredit = pembayaran dikonfirmasi
        </span>
      </div>
    </div>
  )
}
