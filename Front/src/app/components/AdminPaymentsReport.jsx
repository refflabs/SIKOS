import { useState, useMemo } from 'react'
import {
  CreditCard,
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Inbox,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info
} from 'lucide-react'
import {
  usePaymentSummaryQuery,
  usePaymentsQuery,
  useVerifyPaymentMutation,
  useRoomsQuery
} from '../../hooks/queries'
import { formatPrice } from '../../api/roomUtils'
import { Badge } from './Badge'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { LedgerView } from './LedgerView'
import { toast } from 'sonner'

export function AdminPaymentsReport() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [roomId, setRoomId] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [activeView, setActiveView] = useState('table') // 'table' | 'ledger'

  // Modal detail state
  const [selectedPayment, setSelectedPayment] = useState(null)

  // Fetch Rooms for filter dropdown
  const { data: roomsData } = useRoomsQuery()
  const rooms = Array.isArray(roomsData) ? roomsData : []

  // Fetch Summary data
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = usePaymentSummaryQuery()

  // Build query params
  const queryParams = useMemo(() => {
    const params = { page }
    if (search.trim()) params.search = search.trim()
    if (status !== 'all') params.status = status
    if (roomId !== 'all') params.room_id = roomId
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    return params
  }, [search, status, roomId, startDate, endDate, page])

  // Fetch Payments list
  const { data: paymentsData, isLoading: listLoading, refetch: refetchList } = usePaymentsQuery(queryParams)
  const payments = paymentsData?.data || []
  const lastPage = paymentsData?.last_page || 1
  const totalItems = paymentsData?.total || 0

  // Mutation for verifying payments
  const verifyMutation = useVerifyPaymentMutation()

  const handleVerify = async (id, action) => {
    const promise = verifyMutation.mutateAsync({ id, action })
    toast.promise(promise, {
      loading: 'Memproses verifikasi pembayaran...',
      success: () => {
        refetchSummary()
        refetchList()
        setSelectedPayment(null)
        return `Pembayaran berhasil di-${action === 'accept' ? 'setujui' : 'tolak'}`
      },
      error: 'Gagal memproses verifikasi.'
    })
  }

  // Handle Export Backend API
  const handleExportCSV = () => {
    const token = localStorage.getItem('token')
    let url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/payments/export?token=${token}`
    if (status !== 'all') url += `&status=${status}`
    if (roomId !== 'all') url += `&room_id=${roomId}`
    window.open(url, '_blank')
  }

  // Frontend Print PDF function
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 print:p-0">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-primary tracking-tight">Laporan & Verifikasi Pembayaran</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola verifikasi transfer bukti bayar, pantau total omzet kas, dan ekspor laporan keuangan.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-stone-200/50 p-1 rounded-xl border border-border/50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveView('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'table' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Laporan & Tabel
          </button>
          <button
            type="button"
            onClick={() => setActiveView('ledger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'ledger' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Buku Kas (Ledger)
          </button>
        </div>
      </div>

      {/* ── SUMMARY DASHBOARD ── */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-24 bg-secondary rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            {/* Omzet Kas */}
            <div className="rounded-2xl border border-border p-4 bg-card shadow-sm flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Pendapatan</p>
                <p className="text-lg font-black text-foreground mt-0.5">{formatPrice(summary.total_revenue)}</p>
              </div>
            </div>

            {/* Menunggu Verifikasi */}
            <div className="rounded-2xl border border-border p-4 bg-card shadow-sm flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Perlu Verifikasi</p>
                <p className="text-lg font-black text-amber-700 mt-0.5">
                  {formatPrice(summary.pending_amount)}
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">({summary.pending_count} trans)</span>
                </p>
              </div>
            </div>

            {/* Belum Dibayar */}
            <div className="rounded-2xl border border-border p-4 bg-card shadow-sm flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-50 text-stone-600">
                <Info className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Belum Bayar (DP)</p>
                <p className="text-lg font-black text-foreground mt-0.5">{formatPrice(summary.outstanding_amount)}</p>
              </div>
            </div>

            {/* Occupancy Rate */}
            <div className="rounded-2xl border border-border p-4 bg-card shadow-sm flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Okupansi Kamar</p>
                <p className="text-lg font-black text-primary mt-0.5">{summary.occupancy_rate}%</p>
              </div>
            </div>
          </div>
        )
      )}

      {/* ── VIEW RENDERING ── */}
      {activeView === 'ledger' ? (
        <div className="rounded-2xl border border-border p-6 bg-card shadow-sm">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Double-Entry Buku Kas Buku Besar</h3>
          <LedgerView bookings={paymentsData?.data || []} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── FILTERS & CONTROLS ── */}
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nama / ID booking..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background w-full"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Status Filter */}
              <select
                value={status}
                onChange={e => { setStatus(e.target.value); setPage(1) }}
                className="px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="pending_receipt">Menunggu Verifikasi</option>
                <option value="unpaid">Belum Upload</option>
                <option value="accepted">Lunas</option>
                <option value="rejected">Ditolak</option>
              </select>

              {/* Room Filter */}
              <select
                value={roomId}
                onChange={e => { setRoomId(e.target.value); setPage(1) }}
                className="px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              >
                <option value="all">Semua Kamar</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>

              {/* Date inputs */}
              <input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setPage(1) }}
                className="px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setPage(1) }}
                className="px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
              />

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-secondary transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Ekspor CSV
              </button>
            </div>
          </div>

          {/* ── REPORT TABLE ── */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {listLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Memuat data laporan pembayaran...</span>
              </div>
            ) : payments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="Laporan Pembayaran Kosong"
                description="Tidak ada transaksi yang cocok dengan filter atau pencarian Anda saat ini."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4 pl-6">ID Booking</th>
                      <th className="p-4">Penyewa</th>
                      <th className="p-4">Kamar</th>
                      <th className="p-4 text-right">Total Tagihan</th>
                      <th className="p-4">Tanggal Masuk</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {payments.map(payment => {
                      const isPendingVerify = payment.status === 'pending' && payment.payment_receipt
                      const isUnpaid = payment.status === 'pending' && !payment.payment_receipt
                      const isLunas = ['accepted', 'confirmed'].includes(payment.status)
                      const isRejected = payment.status === 'rejected'

                      let badgeVariant = 'default'
                      let badgeText = payment.status

                      if (isPendingVerify) {
                        badgeVariant = 'booked'
                        badgeText = 'Verifikasi'
                      } else if (isUnpaid) {
                        badgeVariant = 'maintenance'
                        badgeText = 'Belum Bayar'
                      } else if (isLunas) {
                        badgeVariant = 'available'
                        badgeText = 'Lunas'
                      } else if (isRejected) {
                        badgeVariant = 'default'
                        badgeText = 'Ditolak'
                      }

                      return (
                        <tr key={payment.id} className="hover:bg-secondary/20 transition-colors duration-150">
                          {/* Booking ID */}
                          <td className="p-4 pl-6 font-mono font-bold text-muted-foreground">#{payment.id}</td>

                          {/* Tenant name */}
                          <td className="p-4 font-semibold text-foreground">{payment.user?.name || 'N/A'}</td>

                          {/* Room name */}
                          <td className="p-4 font-medium text-foreground">{payment.room?.name || 'N/A'}</td>

                          {/* Total price */}
                          <td className="p-4 text-right font-bold text-primary">{formatPrice(payment.total_price)}</td>

                          {/* Check in */}
                          <td className="p-4 text-muted-foreground">
                            {payment.check_in ? new Date(payment.check_in).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>

                          {/* Status Badge */}
                          <td className="p-4 text-center">
                            <Badge variant={badgeVariant}>{badgeText}</Badge>
                          </td>

                          {/* Action Button */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedPayment(payment)}
                              className="inline-flex items-center justify-center p-1.5 rounded-xl border border-border bg-background hover:bg-secondary hover:text-primary transition-all cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalItems > 10 && (
              <div className="flex items-center justify-between p-4 border-t border-border bg-secondary/10 print:hidden">
                <span className="text-[10px] text-muted-foreground">
                  Menampilkan <strong>{Math.min((page - 1) * 10 + 1, totalItems)}</strong> - <strong>{Math.min(page * 10, totalItems)}</strong> dari <strong>{totalItems}</strong> transaksi
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 rounded-lg border border-border bg-background disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={page === lastPage}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 rounded-lg border border-border bg-background disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TRANSACTION DETAIL MODAL & VERIFICATION WORKFLOW ── */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:relative print:bg-transparent print:p-0">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-xl space-y-5 flex flex-col print:border-none print:shadow-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Detail Transaksi #{selectedPayment.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded-lg border border-border bg-secondary hover:bg-border cursor-pointer transition-all"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            {/* Printable Invoice Header */}
            <div className="hidden print:block text-center space-y-1 pb-5 border-b">
              <h1 className="text-lg font-black uppercase tracking-wide text-primary">Kuitansi Pembayaran Kost</h1>
              <p className="text-xs text-muted-foreground">Kost Pak RT &bull; Pekanbaru, Riau</p>
              <p className="text-[10px] text-muted-foreground">ID Booking: #{selectedPayment.id}</p>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
              {/* Tenant info */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-secondary/30 p-3.5 rounded-xl border border-border/40">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Penyewa</p>
                  <p className="font-bold text-foreground mt-0.5">{selectedPayment.user?.name || 'N/A'}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{selectedPayment.user?.email}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{selectedPayment.user?.phone}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Kamar</p>
                  <p className="font-bold text-foreground mt-0.5">{selectedPayment.room?.name || 'N/A'}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Tipe: {selectedPayment.room?.type}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Durasi: {selectedPayment.duration_months} Bulan</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tanggal Masuk</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedPayment.check_in ? new Date(selectedPayment.check_in).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tanggal Keluar</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedPayment.check_out ? new Date(selectedPayment.check_out).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>

              {/* Accounting details */}
              <div className="border-t border-b py-3 flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Total Tagihan</span>
                <span className="text-base font-black text-primary">{formatPrice(selectedPayment.total_price)}</span>
              </div>

              {/* Bukti Transfer Image */}
              {selectedPayment.payment_receipt ? (
                <div className="space-y-1.5 print:hidden">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Bukti Transfer</span>
                  <div className="rounded-xl overflow-hidden border border-border aspect-[4/3] bg-stone-100 flex items-center justify-center relative group">
                    <img
                      src={selectedPayment.payment_receipt}
                      alt="Bukti Transfer"
                      className="max-h-full max-w-full object-contain"
                    />
                    <a
                      href={selectedPayment.payment_receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-lg text-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Lihat Asli ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 text-amber-800 text-xs flex items-start gap-2 print:hidden">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Bukti Pembayaran Belum Diunggah</p>
                    <p className="text-[10px] mt-0.5 opacity-80">
                      Penyewa belum mengirimkan foto bukti transfer via aplikasi.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Verification Workflow Controls */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t print:hidden justify-between">
              <div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-secondary cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Cetak Invoice
                </button>
              </div>

              <div className="flex gap-2">
                {selectedPayment.status === 'pending' && selectedPayment.payment_receipt && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVerify(selectedPayment.id, 'accept')}
                      className="flex items-center gap-1.5 text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Setujui
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(selectedPayment.id, 'reject')}
                      className="flex items-center gap-1.5 text-xs py-2 px-4 border-red-200 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      Tolak
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPayment(null)}
                  className="text-xs py-2 px-4 rounded-xl cursor-pointer"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
