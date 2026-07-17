import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, Send, X, MessageCircle, HelpCircle, Check, CheckCheck, Info } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getSocket } from '../../realtime/socketClient'
import { RealtimeEvents } from '../../realtime/events'

/* ─── Config ─── */
const MAX_MESSAGE_LENGTH = 500

/* ─── AI Knowledge Base: 10 Q&A with keyword triggers ─── */
const AI_KB = [
  {
    id: 'harga',
    question: 'Berapa harga kamar per bulan?',
    answer: 'Harga kamar bervariasi sesuai tipe dan fasilitas:\n• Tipe Kosongan: mulai Rp 500.000/bulan\n• Tipe Isian (lengkap): mulai Rp 750.000/bulan\nSilakan cek halaman Cari Kost untuk harga terkini setiap unit.',
    keywords: ['harga', 'biaya', 'tarif', 'bayar', 'sewa', 'mahal', 'murah', 'berapa', 'cost', 'price'],
  },
  {
    id: 'fasilitas',
    question: 'Fasilitas apa saja yang tersedia?',
    answer: 'Fasilitas standar setiap kamar:\n• WiFi gratis\n• Kamar mandi dalam\n• Lemari pakaian\n• Meja belajar\n• Listrik & air sudah termasuk\n\nTipe Isian menambah: kasur, bantal, guling, dan cermin.',
    keywords: ['fasilitas', 'fasiliti', 'lengkap', 'wifi', 'kasur', 'ac', 'air', 'listrik', 'lemari', 'meja', 'kamar mandi', 'apa saja'],
  },
  {
    id: 'booking',
    question: 'Bagaimana cara booking kamar?',
    answer: 'Cara booking kamar:\n1. Buka halaman "Cari Kost"\n2. Pilih kamar yang tersedia\n3. Klik tombol "Booking Sekarang"\n4. Isi formulir (tanggal masuk, durasi, catatan)\n5. Upload bukti transfer di tab Histori Pembayaran\n6. Tunggu konfirmasi admin (max 1x24 jam)',
    keywords: ['booking', 'pesan', 'cara', 'gimana', 'bagaimana', 'reservasi', 'daftar', 'mendaftar', 'sewa'],
  },
  {
    id: 'perempuan',
    question: 'Apakah ada kost untuk perempuan?',
    answer: 'Ya! Kami menyediakan kost untuk:\n• Penghuni putra\n• Penghuni putri\n• Campuran\n\nAturan syariah tetap berlaku: tamu lawan jenis non-muhrim tidak diizinkan masuk kamar.',
    keywords: ['perempuan', 'putri', 'wanita', 'cewek', 'laki', 'putra', 'cowok', 'syariah', 'aturan', 'gender'],
  },
  {
    id: 'lokasi',
    question: 'Lokasi kost di mana?',
    answer: 'Lokasi kost kami:\nJl. Letjend. S.Parman, Gg. Al-Khalish No.18A\nCinta Raja, Sail, Kota Pekanbaru, Riau 28127\n\nDekat dengan kampus-kampus utama di Pekanbaru. Tersedia parkir motor.',
    keywords: ['lokasi', 'alamat', 'dimana', 'di mana', 'jalan', 'maps', 'peta', 'parkir', 'jauh', 'dekat', 'tempat'],
  },
  {
    id: 'pembayaran',
    question: 'Bagaimana cara melakukan pembayaran?',
    answer: 'Metode pembayaran:\n• Transfer bank (konfirmasi admin via WhatsApp)\n• Tunai langsung ke pengelola\n\nSetelah transfer, upload bukti bayar di tab Histori Pembayaran di akun Anda. Admin akan verifikasi dalam 1x24 jam.',
    keywords: ['bayar', 'transfer', 'pembayaran', 'rekening', 'bank', 'tunai', 'cash', 'kirim', 'bukti'],
  },
  {
    id: 'durasi',
    question: 'Minimum sewa berapa bulan?',
    answer: 'Minimum sewa adalah 1 bulan. Kami juga melayani sewa jangka panjang (3, 6, atau 12 bulan) dengan kemungkinan harga lebih hemat. Hubungi Pak RT untuk negosiasi harga sewa tahunan.',
    keywords: ['durasi', 'lama', 'bulan', 'tahun', 'minimum', 'kontrak', 'lama sewa', 'berapa lama'],
  },
  {
    id: 'kontak',
    question: 'Bagaimana cara menghubungi pengelola?',
    answer: 'Cara menghubungi Pak RT:\n• WhatsApp: +62 812-3456-7890\n• Email: support@kostpakrt.com\n• Chat langsung di aplikasi ini (saat Pak RT online)\n\nJam operasional: 08.00 – 21.00 WIB.',
    keywords: ['kontak', 'hubungi', 'telepon', 'phone', 'wa', 'whatsapp', 'email', 'admin', 'pengelola', 'pak rt'],
  },
  {
    id: 'syarat',
    question: 'Apa syarat untuk menjadi penghuni?',
    answer: 'Syarat menjadi penghuni Kost Pak RT:\n1. Mengisi formulir registrasi online\n2. Menyertakan identitas diri (KTP/KTM)\n3. Menyetujui tata tertib kost syariah\n4. Membayar uang muka (DP) minimal 1 bulan',
    keywords: ['syarat', 'ketentuan', 'dokumen', 'ktp', 'ktm', 'identitas', 'peraturan', 'tata tertib', 'deposit', 'dp'],
  },
  {
    id: 'ketersediaan',
    question: 'Apakah masih ada kamar yang tersedia?',
    answer: 'Ketersediaan kamar berubah setiap saat. Silakan cek halaman Cari Kost untuk melihat status kamar secara real-time. Kamar dengan label "Tersedia" bisa langsung di-booking.',
    keywords: ['tersedia', 'kosong', 'ada', 'masih', 'available', 'stock', 'kamar kosong', 'penuh'],
  },
]

/* ─── AI keyword matching engine ─── */
function findAIResponse(input) {
  const text = input.toLowerCase().trim()
  if (!text) return null

  let bestMatch = null
  let bestScore = 0

  for (const item of AI_KB) {
    let score = 0
    for (const kw of item.keywords) {
      if (text.includes(kw)) score += kw.split(' ').length // multi-word kw weighs more
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = item
    }
  }

  return bestScore > 0 ? bestMatch : null
}

/* ─── Read Receipt Icon ─── */
function ReadReceipt({ status }) {
  if (status === 'sending') return <Check className="h-3 w-3 opacity-40" style={{ color: 'var(--muted-foreground)' }} />
  if (status === 'sent') return <Check className="h-3 w-3" style={{ color: 'var(--muted-foreground)' }} />
  if (status === 'delivered') return <CheckCheck className="h-3 w-3" style={{ color: 'var(--muted-foreground)' }} />
  if (status === 'read') return <CheckCheck className="h-3 w-3" style={{ color: 'var(--primary)' }} />
  return null
}

/* ─── Online Dot ─── */
function OnlineDot({ online }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {online && (
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
          style={{ background: '#4ade80' }}
        />
      )}
      <span
        className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ background: online ? '#22c55e' : '#6b7280' }}
      />
    </span>
  )
}

export function ChatWidget() {
  const { user } = useAuth()
  const { connected } = useSocket()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [adminOnline, setAdminOnline] = useState(false)
  const [showFaq, setShowFaq] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Don't render for admins
  if (user?.role === 'admin') return null

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnreadCount(0)
      const socket = getSocket()
      if (socket && user) {
        socket.emit(RealtimeEvents.CHAT_MARK_READ, {})
        setMessages(prev =>
          prev.map(m => (m.role !== 'admin' && m.status !== 'read' ? { ...m, status: 'read' } : m))
        )
      }
    }
  }, [isOpen, scrollToBottom])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  /* ── Socket listeners ── */
  useEffect(() => {
    if (!user) {
      setMessages([])
      setAdminOnline(false)
      return
    }

    const socket = getSocket()
    if (!socket) return

    const checkAdminPresence = () => {
      socket.emit('presence:get_admin', {}, (res) => {
        if (res?.online !== undefined) setAdminOnline(res.online)
      })
    }

    if (socket.connected) {
      socket.emit(RealtimeEvents.CHAT_GET_HISTORY, {}, (history) => {
        if (Array.isArray(history)) {
          const withStatus = history.map(m => ({
            ...m,
            status: m.role !== 'admin' ? (m.read ? 'read' : 'delivered') : undefined,
          }))
          setMessages(withStatus)
        }
      })
      checkAdminPresence()
    }

    const handleConnect = () => {
      socket.emit(RealtimeEvents.CHAT_GET_HISTORY, {}, (history) => {
        if (Array.isArray(history)) {
          const withStatus = history.map(m => ({
            ...m,
            status: m.role !== 'admin' ? (m.read ? 'read' : 'delivered') : undefined,
          }))
          setMessages(withStatus)
        }
      })
      checkAdminPresence()
    }

    const handleNewMessage = (msg) => {
      if (msg.userId === user.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, { ...msg, status: msg.role !== 'admin' ? 'delivered' : undefined }]
        })
        if (!isOpen) setUnreadCount(c => c + 1)
      }
    }

    const handleAdminOnline = (payload) => {
      if (!payload || payload.role === 'admin') setAdminOnline(true)
    }
    const handleAdminOffline = (payload) => {
      if (!payload || payload.role === 'admin') setAdminOnline(false)
    }

    const handleMessageRead = ({ messageId }) => {
      setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, status: 'read' } : m)))
    }

    const handleSessionDeleted = ({ userId }) => {
      if (user && Number(userId) === user.id) setMessages([])
    }

    const handleAllDeleted = () => setMessages([])

    socket.on('connect', handleConnect)
    socket.on(RealtimeEvents.CHAT_MESSAGE_RECEIVED, handleNewMessage)
    socket.on(RealtimeEvents.USER_ONLINE, handleAdminOnline)
    socket.on(RealtimeEvents.USER_OFFLINE, handleAdminOffline)
    socket.on(RealtimeEvents.CHAT_MESSAGE_READ, handleMessageRead)
    socket.on('chat:session_deleted', handleSessionDeleted)
    socket.on('chat:all_deleted', handleAllDeleted)

    return () => {
      socket.off('connect', handleConnect)
      socket.off(RealtimeEvents.CHAT_MESSAGE_RECEIVED, handleNewMessage)
      socket.off(RealtimeEvents.USER_ONLINE, handleAdminOnline)
      socket.off(RealtimeEvents.USER_OFFLINE, handleAdminOffline)
      socket.off(RealtimeEvents.CHAT_MESSAGE_READ, handleMessageRead)
      socket.off('chat:session_deleted', handleSessionDeleted)
      socket.off('chat:all_deleted', handleAllDeleted)
    }
  }, [user, isOpen, connected])

  /* ── Send real message + AI fallback when offline ── */
  const handleSendMessage = (e) => {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed) return
    if (trimmed.length > MAX_MESSAGE_LENGTH) return

    const socket = getSocket()

    setInputText('')

    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId,
      text: trimmed,
      role: user.role,
      userId: user.id,
      timestamp: new Date().toISOString(),
      status: 'sending',
    }
    setMessages(prev => [...prev, optimistic])

    // If offline — try AI keyword match
    if (!adminOnline) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'read', isFaq: true } : m))
      setAiTyping(true)
      const match = findAIResponse(trimmed)
      setTimeout(() => {
        setAiTyping(false)
        const aiMsg = {
          id: `ai-${Date.now()}`,
          text: match
            ? match.answer
            : 'Maaf, saya belum punya jawaban untuk pertanyaan itu. Silakan hubungi Pak RT via WhatsApp atau coba lagi saat beliau online. 🙏',
          role: 'admin',
          timestamp: new Date().toISOString(),
          isAutoReply: true,
        }
        setMessages(prev => [...prev, aiMsg])
      }, 900)
    }

    // Always try socket send (will be queued server-side if offline)
    if (socket && connected) {
      socket.emit(RealtimeEvents.CHAT_SEND_MESSAGE, { text: trimmed }, (res) => {
        if (res?.ok && res.message) {
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== tempId)
            if (filtered.some(m => m.id === res.message.id)) return filtered
            return [...filtered, { ...res.message, status: 'sent' }]
          })
        }
      })
    }

    inputRef.current?.focus()
  }

  /* ── FAQ quick reply (offline) ── */
  const handleFaqReply = (item) => {
    const questionMsg = {
      id: `faq-q-${Date.now()}`,
      text: item.question,
      role: user?.role || 'tenant',
      userId: user?.id,
      timestamp: new Date().toISOString(),
      status: 'read',
      isFaq: true,
    }
    setMessages(prev => [...prev, questionMsg])
    setShowFaq(false)
    setAiTyping(true)
    setTimeout(() => {
      setAiTyping(false)
      const answerMsg = {
        id: `faq-a-${Date.now() + 1}`,
        text: item.answer,
        role: 'admin',
        timestamp: new Date().toISOString(),
        isAutoReply: true,
      }
      setMessages(prev => [...prev, answerMsg])
    }, 800)
  }

  const formatTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const statusLabel = adminOnline ? 'Online' : connected ? 'Offline' : 'Menghubungkan...'
  const charsLeft = MAX_MESSAGE_LENGTH - inputText.length
  const isNearLimit = charsLeft <= 80

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* ── FAB ── */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
        style={{
          background: 'var(--primary)',
          color: '#ffffff',
        }}
        aria-label="Chat dengan Pak RT"
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.background = 'var(--primary-dark)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--primary)' }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ background: '#ef4444', color: '#fff', border: '2px solid white' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className="absolute bottom-18 right-0 w-[340px] sm:w-[380px] flex flex-col rounded-2xl overflow-hidden"
          style={{
            height: '520px',
            maxHeight: '82vh',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            animation: 'chatSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <style>{`
            @keyframes chatSlideIn {
              from { opacity: 0; transform: translateY(12px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-4 py-3.5 shrink-0"
            style={{
              background: 'var(--primary)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative shrink-0">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
                >
                  RT
                </span>
                <span
                  className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                  style={{ background: 'var(--primary-dark)' }}
                >
                  <OnlineDot online={adminOnline} />
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold leading-tight text-white">
                  {adminOnline ? 'Pak RT' : 'Asisten AI (Beta)'}
                </h4>
                <span className="text-[10px] font-medium" style={{ color: adminOnline ? '#86efac' : 'rgba(255,255,255,0.6)' }}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* WA link */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20saya%20butuh%20bantuan%20terkait%20kost."
              target="_blank"
              rel="noopener noreferrer"
              title="Hubungi via WhatsApp"
              className="p-2 rounded-xl transition-colors cursor-pointer"
              style={{ color: '#86efac', background: 'rgba(134,239,172,0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(134,239,172,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(134,239,172,0.15)' }}
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </a>
          </div>

          {/* ── Offline banner ── */}
          {user && !adminOnline && connected && (
            <div
              className="flex items-start gap-2 px-4 py-2.5 text-xs shrink-0"
              style={{
                background: 'rgba(199,154,99,0.1)',
                borderBottom: '1px solid rgba(199,154,99,0.2)',
                color: 'var(--accent, #c79a63)',
              }}
            >
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                Pak RT sedang offline.{' '}
                <button
                  type="button"
                  className="font-semibold underline cursor-pointer"
                  onClick={() => setShowFaq(v => !v)}
                >
                  {showFaq ? 'Tutup Asisten AI' : 'Tanya Asisten AI'}
                </button>
                {' '}atau{' '}
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  WhatsApp ↗
                </a>
              </span>
            </div>
          )}

          {/* ── FAQ Quick Replies (offline) ── */}
          {user && showFaq && !adminOnline && (
            <div
              className="px-3 py-2.5 shrink-0 space-y-1.5 overflow-y-auto"
              style={{
                maxHeight: '160px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--secondary)',
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                Pertanyaan umum — ketuk untuk bertanya:
              </p>
              {AI_KB.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFaqReply(item)}
                  className="w-full text-left text-xs px-3 py-2 rounded-xl transition-colors duration-150 cursor-pointer border"
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--foreground)' }}
                >
                  {item.question}
                </button>
              ))}
            </div>
          )}

          {/* ── Messages body ── */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ background: 'var(--background)' }}
          >
            {!user ? (
              /* Guest — not logged in */
              <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(107,143,113,0.1)', color: 'var(--primary)' }}
                >
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Hubungi Pak RT</h5>
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    Masuk ke akun Anda untuk mulai chat langsung dengan pengelola kost.
                  </p>
                </div>
                <div className="w-full pt-2 space-y-2">
                  <a href="/login" className="block w-full">
                    <button
                      className="w-full py-2.5 rounded-xl text-xs font-bold"
                      style={{ background: 'var(--primary)', color: '#ffffff' }}
                    >
                      Masuk ke Akun
                    </button>
                  </a>
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Pak%20RT."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <button
                      className="w-full py-2.5 rounded-xl text-xs font-semibold border"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'transparent' }}
                    >
                      Hubungi via WhatsApp ↗
                    </button>
                  </a>
                </div>
              </div>
            ) : messages.length === 0 ? (
              /* No messages yet */
              <div className="flex flex-col items-center justify-center h-full text-center px-6 space-y-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(107,143,113,0.1)', color: 'var(--primary)' }}
                >
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-xs" style={{ color: 'var(--foreground)' }}>Belum ada percakapan</p>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {adminOnline
                      ? 'Pak RT sedang online. Kirim pesan untuk mulai berkonsultasi.'
                      : 'Pak RT offline. Ketik pertanyaan atau pilih topik di atas — Asisten AI siap membantu.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Message list */
              messages.map((msg) => {
                const isAdmin = msg.role === 'admin'
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                      {/* Auto-reply label */}
                      {msg.isAutoReply && (
                        <span className="text-[9px] mb-0.5 px-1 font-semibold" style={{ color: 'var(--primary)' }}>
                          Asisten AI · Jawaban otomatis
                        </span>
                      )}
                      <div
                        className="px-3.5 py-2 text-xs leading-relaxed"
                        style={{
                          borderRadius: isAdmin ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                          background: isAdmin ? 'var(--card)' : 'var(--primary)',
                          color: isAdmin ? 'var(--foreground)' : '#ffffff',
                          border: isAdmin ? '1px solid var(--border)' : 'none',
                          whiteSpace: msg.isAutoReply ? 'pre-line' : 'normal',
                        }}
                      >
                        {msg.text}
                      </div>

                      {/* Time + read receipt */}
                      <div className="flex items-center gap-1 mt-0.5 px-1">
                        <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
                          {formatTime(msg.timestamp)}
                        </span>
                        {!isAdmin && msg.status && <ReadReceipt status={msg.status} />}
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {/* AI typing indicator */}
            {aiTyping && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-2.5 flex items-center gap-1"
                  style={{
                    borderRadius: '4px 16px 16px 16px',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="block h-1.5 w-1.5 rounded-full"
                      style={{
                        background: 'var(--muted-foreground)',
                        animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                  <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }`}</style>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input footer ── */}
          {user && (
            <div
              className="shrink-0"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}
            >
              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 items-center px-3 pt-2.5 pb-2"
              >
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={e => {
                      if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                        setInputText(e.target.value)
                      }
                    }}
                    placeholder={connected ? 'Ketik pesan...' : 'Koneksi terputus...'}
                    disabled={!connected}
                    maxLength={MAX_MESSAGE_LENGTH}
                    className="w-full text-xs px-4 py-2.5 rounded-xl focus:outline-none transition-all duration-200"
                    style={{
                      background: 'var(--background)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputText.trim() || !connected || inputText.length > MAX_MESSAGE_LENGTH}
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-30 shrink-0"
                  style={{ background: 'var(--primary)', color: '#ffffff' }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--primary-dark)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)' }}
                  aria-label="Kirim pesan"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Character counter — only shows when near limit */}
              {isNearLimit && (
                <div
                  className="px-4 pb-2 text-right"
                >
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: charsLeft <= 20 ? '#dc2626' : 'var(--muted-foreground)' }}
                  >
                    {charsLeft} karakter tersisa
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
