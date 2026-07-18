import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, Send, X, MessageCircle, HelpCircle, Check, CheckCheck, Info, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getSocket } from '../../realtime/socketClient'
import { RealtimeEvents } from '../../realtime/events'
import { useRoomsQuery } from '../../hooks/queries'

/* ─── Config ─── */
const MAX_MESSAGE_LENGTH = 500

/* ─── AI Knowledge Base: 10 Q&A with keyword triggers ─── */
const AI_KB = [
  {
    id: 'harga',
    question: 'Berapa harga kamar per bulan?',
    answer: 'Harga sewa kamar bervariasi sesuai tipe:\n• Tipe Kosongan: mulai Rp 500.000/bulan\n• Tipe Isian (lengkap): mulai Rp 750.000/bulan\nSilakan cek rekomendasi kamar di bawah ini atau buka halaman Cari Kost.',
    keywords: ['harga', 'biaya', 'tarif', 'bayar', 'sewa', 'mahal', 'murah', 'berapa', 'cost', 'price'],
  },
  {
    id: 'fasilitas',
    question: 'Fasilitas apa saja yang tersedia?',
    answer: 'Fasilitas standar setiap kamar:\n• WiFi gratis cepat\n• Kamar mandi dalam\n• Lemari pakaian\n• Meja belajar\n• Listrik & air sudah termasuk\n\nTipe Isian menambah: kasur springbed, bantal, guling, dan cermin.',
    keywords: ['fasilitas', 'fasiliti', 'lengkap', 'wifi', 'kasur', 'ac', 'air', 'listrik', 'lemari', 'meja', 'kamar mandi', 'apa saja'],
  },
  {
    id: 'booking',
    question: 'Bagaimana cara booking kamar?',
    answer: 'Alur booking kamar di SIKOS:\n1. Cari kamar di halaman Cari Kost.\n2. Klik Booking Sekarang.\n3. Isi data pengontrak.\n4. Lakukan transfer dan upload bukti bayar di tab Histori Pembayaran.',
    keywords: ['booking', 'pesan', 'cara', 'gimana', 'bagaimana', 'reservasi', 'daftar', 'mendaftar', 'sewa'],
  },
  {
    id: 'perempuan',
    question: 'Apakah ada kost untuk perempuan?',
    answer: 'Ya! Kami menyediakan kost syariah untuk putra dan putri secara terpisah. Tamu lawan jenis non-muhrim dilarang masuk kamar demi ketertiban bersama.',
    keywords: ['perempuan', 'putri', 'wanita', 'cewek', 'laki', 'putra', 'cowok', 'syariah', 'aturan', 'gender'],
  },
  {
    id: 'lokasi',
    question: 'Lokasi kost di mana?',
    answer: 'Lokasi Kost Pak RT:\nJl. Letjend. S.Parman, Gg. Al-Khalish No.18A, Cinta Raja, Sail, Kota Pekanbaru, Riau 28127. Dekat dengan pusat pendidikan dan kuliner.',
    keywords: ['lokasi', 'alamat', 'dimana', 'di mana', 'jalan', 'maps', 'peta', 'parkir', 'jauh', 'dekat', 'tempat'],
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
      if (text.includes(kw)) score += kw.split(' ').length
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = item
    }
  }

  return bestScore > 0 ? bestMatch : null
}

/* ─── Parser Tag Widget ─── */
function parseWidgetTag(text) {
  let cleanText = text || '';
  let activeWidget = null;

  if (cleanText.includes('[ROOMS_CAROUSEL]')) {
    cleanText = cleanText.replace('[ROOMS_CAROUSEL]', '').trim();
    activeWidget = 'ROOMS_CAROUSEL';
  } else if (cleanText.includes('[CONTACT_CARD]')) {
    cleanText = cleanText.replace('[CONTACT_CARD]', '').trim();
    activeWidget = 'CONTACT_CARD';
  } else if (cleanText.includes('[BOOKING_WIDGET]')) {
    cleanText = cleanText.replace('[BOOKING_WIDGET]', '').trim();
    activeWidget = 'BOOKING_WIDGET';
  }

  return { cleanText, activeWidget };
}

/* ─── Simple Markdown Formatter ─── */
function renderFormattedText(text) {
  if (!text) return ''
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold" style={{ fontWeight: 800 }}>{part.slice(2, -2)}</strong>
    }
    return part
  })
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

/* ─── Interactive Widget 1: Rooms Carousel ─── */
function RoomsCarouselWidget() {
  const { data, isLoading } = useRoomsQuery()
  const rooms = Array.isArray(data) ? data.filter(r => r.stock > 0) : []

  if (isLoading) {
    return (
      <div className="flex gap-2.5 py-2 overflow-x-auto shrink-0 w-full scrollbar-none mt-2">
        {[1, 2].map(i => (
          <div key={i} className="w-[190px] h-[140px] rounded-2xl animate-pulse bg-gray-200 dark:bg-zinc-800 shrink-0" />
        ))}
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="text-[10px] p-4 text-center rounded-2xl border border-dashed border-border mt-2" style={{ color: 'var(--muted-foreground)' }}>
        Kamar penuh atau tidak tersedia saat ini.
      </div>
    )
  }

  return (
    <div className="flex gap-2.5 py-2 overflow-x-auto shrink-0 w-full scrollbar-none mt-2" style={{ scrollSnapType: 'x mandatory' }}>
      {rooms.map(room => (
        <div
          key={room.id}
          className="w-[190px] bg-card rounded-2xl border overflow-hidden shrink-0 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 flex flex-col"
          style={{ borderColor: 'var(--border)', scrollSnapAlign: 'start' }}
        >
          {room.image ? (
            <img src={room.image} alt={room.name} className="h-20 w-full object-cover shrink-0" />
          ) : (
            <div className="h-20 w-full bg-secondary flex items-center justify-center text-[10px] text-muted-foreground shrink-0">No Image</div>
          )}
          <div className="p-2.5 flex-1 flex flex-col justify-between">
            <div>
              <h5 className="font-bold text-[11px] truncate text-foreground leading-tight">{room.name}</h5>
              <p className="text-[9px] text-muted-foreground mt-0.5 capitalize">{room.type} · Lantai {room.floor || 1}</p>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
              <span className="font-bold text-[10px] text-primary">
                Rp {Number(room.price).toLocaleString('id-ID')}/bln
              </span>
              <a
                href={`/rooms/${room.id}`}
                className="text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                style={{ background: 'var(--primary)', color: '#ffffff' }}
              >
                Pesan
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Interactive Widget 2: Contact Card ─── */
function ContactCardWidget() {
  return (
    <div className="p-3 bg-card border rounded-2xl shadow-sm w-full space-y-2 mt-2" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0 border border-emerald-100 dark:border-emerald-900/30">
          WA
        </span>
        <div>
          <h5 className="font-bold text-[11px] text-foreground leading-tight">Pak RT (Pengelola Kost)</h5>
          <p className="text-[9px] text-muted-foreground mt-0.5">Operasional: 08.00 - 21.00 WIB</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <a
          href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20saya%20tertarik%20dengan%20Kost%20Pak%20RT."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer"
        >
          WhatsApp ↗
        </a>
        <a
          href="https://maps.google.com/?q=Gang+Al-Khalish+No.18A,+Cinta+Raja,+Sail,+Pekanbaru"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold border transition-colors hover:bg-secondary cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          Google Maps ↗
        </a>
      </div>
    </div>
  )
}

/* ─── Interactive Widget 3: Booking Steps ─── */
function BookingWidget() {
  return (
    <div className="p-3.5 bg-card border rounded-2xl shadow-sm w-full space-y-3.5 mt-2" style={{ borderColor: 'var(--border)' }}>
      <h5 className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
        <span>Alur Booking Kamar SIKOS</span>
      </h5>
      <div className="relative pl-3.5 border-l border-primary/30 space-y-3.5">
        <div className="relative">
          <div className="absolute -left-[20px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary border border-card" />
          <p className="text-[10px] font-bold text-foreground">1. Cari Kamar</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Buka halaman Cari Kost dan pilih kamar kosong.</p>
        </div>
        <div className="relative">
          <div className="absolute -left-[20px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary border border-card" />
          <p className="text-[10px] font-bold text-foreground">2. Ajukan Booking</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Klik Booking Sekarang dan isi tanggal masuk & durasi.</p>
        </div>
        <div className="relative">
          <div className="absolute -left-[20px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary border border-card" />
          <p className="text-[10px] font-bold text-foreground">3. Pembayaran & Verifikasi</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Upload bukti bayar di tab Histori Pembayaran.</p>
        </div>
      </div>
      <a href="/" className="block">
        <button
          className="w-full py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-colors text-white"
          style={{ background: 'var(--primary)' }}
        >
          Cari Kamar Kost
        </button>
      </a>
    </div>
  )
}

export function ChatWidget() {
  const { user } = useAuth()
  const { connected } = useSocket()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [aiMessages, setAiMessages] = useState([])
  const [chatMode, setChatMode] = useState('owner') // 'owner' | 'ai'
  const [inputText, setInputText] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [adminOnline, setAdminOnline] = useState(false)
  const [showFaq, setShowFaq] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Don't render for admins
  if (user?.role === 'admin') return null

  /* ── Initialize welcome message for AI mode ── */
  useEffect(() => {
    if (aiMessages.length === 0) {
      setAiMessages([
        {
          id: 'welcome-ai',
          text: 'Halo! Saya adalah **Asisten AI Kost Pak RT**. Saya bisa mencarikan kamar kosong, memberi tahu info seputar harga sewa, fasilitas, lokasi, hingga memandu Anda cara melakukan booking secara otomatis. Ada yang ingin ditanyakan? 😊',
          role: 'admin',
          timestamp: new Date().toISOString(),
          isAutoReply: true,
        }
      ])
    }
  }, [aiMessages])

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      if (chatMode === 'owner') {
        setUnreadCount(0)
        const socket = getSocket()
        if (socket && user) {
          socket.emit(RealtimeEvents.CHAT_MARK_READ, {})
          setMessages(prev =>
            prev.map(m => (m.role !== 'admin' && m.status !== 'read' ? { ...m, status: 'read' } : m))
          )
        }
      }
    }
  }, [isOpen, chatMode, scrollToBottom])

  useEffect(() => {
    scrollToBottom()
  }, [messages, aiMessages, aiTyping, scrollToBottom])

  /* ── Socket listeners for Owner Chat ── */
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
        if (!isOpen || chatMode !== 'owner') setUnreadCount(c => c + 1)
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
  }, [user, isOpen, chatMode, connected])

  /* ── Send Message Router ── */
  const handleSendMessage = (e) => {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed) return
    if (trimmed.length > MAX_MESSAGE_LENGTH) return

    setInputText('')

    if (chatMode === 'ai') {
      handleSendAiMessage(trimmed)
    } else {
      handleSendOwnerMessage(trimmed)
    }
  }

  /* ── Send Message in AI Mode (LLM integration with fallback) ── */
  const handleSendAiMessage = async (trimmed) => {
    const userMsg = {
      id: `user-ai-${Date.now()}`,
      text: trimmed,
      role: user?.role || 'tenant',
      userId: user?.id,
      timestamp: new Date().toISOString(),
    }

    setAiMessages(prev => [...prev, userMsg])
    setAiTyping(true)

    // Build context history (last 6 messages)
    const history = [...aiMessages, userMsg]
      .slice(-6)
      .map(m => ({
        role: m.role === 'admin' ? 'assistant' : 'user',
        content: m.text,
      }))

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok) throw new Error('API failed')

      const data = await res.json()
      setAiMessages(prev => [...prev, {
        id: `ai-reply-${Date.now()}`,
        text: data.reply,
        role: 'admin',
        timestamp: new Date().toISOString(),
        isAutoReply: true,
      }])
    } catch (err) {
      // Offline / Error fallback to keyword engine
      const match = findAIResponse(trimmed)
      
      let fallbackText = 'Maaf, saya tidak begitu mengerti pertanyaan tersebut. Silakan tanyakan informasi seputar harga sewa, fasilitas, lokasi, atau tata cara booking kost Pak RT.'
      if (match) {
        fallbackText = match.answer
        if (match.id === 'harga' || match.id === 'ketersediaan') {
          fallbackText += ' [ROOMS_CAROUSEL]'
        } else if (match.id === 'lokasi' || match.id === 'kontak') {
          fallbackText += ' [CONTACT_CARD]'
        } else if (match.id === 'booking') {
          fallbackText += ' [BOOKING_WIDGET]'
        }
      }

      setAiMessages(prev => [...prev, {
        id: `ai-reply-fallback-${Date.now()}`,
        text: fallbackText,
        role: 'admin',
        timestamp: new Date().toISOString(),
        isAutoReply: true,
      }])
    } finally {
      setAiTyping(false)
      inputRef.current?.focus()
    }
  }

  /* ── Send Message in Owner Mode (Socket) ── */
  const handleSendOwnerMessage = (trimmed) => {
    const socket = getSocket()
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

    // If offline — try AI keyword match as quick auto reply
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
            : 'Maaf, Pak RT sedang offline saat ini. Pesan Anda telah dikirim dan akan segera dijawab ketika beliau aktif kembali. Jika mendesak, silakan klik tombol WhatsApp hijau di atas. 🙏',
          role: 'admin',
          timestamp: new Date().toISOString(),
          isAutoReply: true,
        }
        setMessages(prev => [...prev, aiMsg])
      }, 900)
    }

    // Emit socket
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

  /* ── FAQ quick reply (offline owner mode) ── */
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

  const statusLabel = chatMode === 'ai' ? 'Copilot AI Aktif' : adminOnline ? 'Owner Online' : 'Owner Offline'
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
        aria-label="Sistem Chat SIKOS"
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.background = 'var(--primary-dark)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--primary)' }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold animate-pulse"
            style={{ background: '#ef4444', color: '#fff', border: '2px solid white' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className="absolute bottom-18 right-0 w-[345px] sm:w-[390px] flex flex-col rounded-2xl overflow-hidden"
          style={{
            height: '560px',
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
            .scrollbar-none::-webkit-scrollbar { display: none; }
            .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
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
              <div className="relative shrink-0">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
                >
                  {chatMode === 'ai' ? 'AI' : 'RT'}
                </span>
                {chatMode === 'owner' && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                    style={{ background: 'var(--primary-dark)' }}
                  >
                    <OnlineDot online={adminOnline} />
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold leading-tight text-white flex items-center gap-1.5">
                  {chatMode === 'ai' ? 'Asisten AI SIKOS' : 'Hubungi Pak RT'}
                  {chatMode === 'ai' && <Sparkles className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" />}
                </h4>
                <span className="text-[10px] font-medium" style={{ color: chatMode === 'ai' || adminOnline ? '#86efac' : 'rgba(255,255,255,0.6)' }}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* WA Link */}
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

          {/* ── Mode Segmented Control ── */}
          {user && (
            <div
              className="flex p-1 shrink-0"
              style={{
                background: 'var(--secondary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                className="flex-1 text-center py-2 text-[11px] font-bold rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: chatMode === 'owner' ? 'var(--card)' : 'transparent',
                  color: chatMode === 'owner' ? 'var(--primary)' : 'var(--muted-foreground)',
                  boxShadow: chatMode === 'owner' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => { setChatMode('owner'); setUnreadCount(0) }}
              >
                Tanya Pemilik (RT)
              </button>
              <button
                type="button"
                className="flex-1 text-center py-2 text-[11px] font-bold rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: chatMode === 'ai' ? 'var(--card)' : 'transparent',
                  color: chatMode === 'ai' ? 'var(--primary)' : 'var(--muted-foreground)',
                  boxShadow: chatMode === 'ai' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setChatMode('ai')}
              >
                Tanya Asisten AI 🤖
              </button>
            </div>
          )}

          {/* ── Owner Mode: Offline Banner ── */}
          {chatMode === 'owner' && user && !adminOnline && connected && (
            <div
              className="flex items-start gap-2 px-4 py-2 text-xs shrink-0"
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
                  {showFaq ? 'Tutup Quick FAQ' : 'Tanya Quick FAQ'}
                </button>
                {' '}atau gunakan mode **Tanya Asisten AI** di atas.
              </span>
            </div>
          )}

          {/* ── Owner Mode: FAQ List ── */}
          {chatMode === 'owner' && user && showFaq && !adminOnline && (
            <div
              className="px-3 py-2 shrink-0 space-y-1.5 overflow-y-auto"
              style={{
                maxHeight: '130px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--secondary)',
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Pertanyaan umum — ketuk untuk bertanya:
              </p>
              {AI_KB.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFaqReply(item)}
                  className="w-full text-left text-xs px-3 py-1.5 rounded-xl transition-colors duration-150 cursor-pointer border"
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

          {/* ── AI Mode: Suggestion Chips ── */}
          {chatMode === 'ai' && user && aiMessages.length <= 1 && (
            <div
              className="px-3 py-2 shrink-0 space-y-1.5"
              style={{
                borderBottom: '1px solid var(--border)',
                background: 'var(--secondary)',
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Rekomendasi topik — ketuk untuk bertanya:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Berapa harga sewa kost?',
                  'Fasilitas apa saja yang ada?',
                  'Di mana alamat kost Pak RT?',
                  'Bagaimana cara booking kamar?'
                ].map((txt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendAiMessage(txt)}
                    className="text-[10px] px-2.5 py-1.5 rounded-full border cursor-pointer transition-all duration-150"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--foreground)' }}
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages Body ── */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ background: 'var(--background)' }}
          >
            {!user ? (
              /* Guest mode */
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
                    Masuk ke akun Anda untuk mulai chat langsung dengan pengelola kost atau asisten AI.
                  </p>
                </div>
                <div className="w-full pt-2 space-y-2">
                  <a href="/login" className="block w-full">
                    <button
                      className="w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer"
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
                      className="w-full py-2.5 rounded-xl text-xs font-semibold border cursor-pointer"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'transparent' }}
                    >
                      Hubungi via WhatsApp ↗
                    </button>
                  </a>
                </div>
              </div>
            ) : (chatMode === 'owner' ? messages : aiMessages).length === 0 ? (
              /* Empty state */
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
                    {chatMode === 'owner'
                      ? (adminOnline ? 'Pak RT sedang online. Kirim pesan untuk mulai bertanya.' : 'Pak RT sedang offline. Pesan Anda akan terkirim saat beliau kembali online.')
                      : 'Ketik apa saja untuk bertanya langsung kepada Asisten AI.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Message List */
              (chatMode === 'owner' ? messages : aiMessages).map((msg) => {
                const isAdmin = msg.role === 'admin'
                const { cleanText, activeWidget } = parseWidgetTag(msg.text)
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                      {msg.isAutoReply && (
                        <span className="text-[9px] mb-0.5 px-1 font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                          Asisten AI
                          {chatMode === 'ai' && <Sparkles className="h-2.5 w-2.5 text-yellow-500" />}
                        </span>
                      )}
                      <div
                        className="px-3.5 py-2 text-xs leading-relaxed"
                        style={{
                          borderRadius: isAdmin ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                          background: isAdmin ? 'var(--card)' : 'var(--primary)',
                          color: isAdmin ? 'var(--foreground)' : '#ffffff',
                          border: isAdmin ? '1px solid var(--border)' : 'none',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {renderFormattedText(cleanText)}
                      </div>

                      {/* Render Interactive Actions Widget below message bubble */}
                      {activeWidget === 'ROOMS_CAROUSEL' && <RoomsCarouselWidget />}
                      {activeWidget === 'CONTACT_CARD' && <ContactCardWidget />}
                      {activeWidget === 'BOOKING_WIDGET' && <BookingWidget />}

                      {/* Time + Receipt */}
                      <div className="flex items-center gap-1 mt-0.5 px-1">
                        <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
                          {formatTime(msg.timestamp)}
                        </span>
                        {!isAdmin && msg.status && chatMode === 'owner' && <ReadReceipt status={msg.status} />}
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {/* AI Typing Indicator */}
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

          {/* ── Input Footer ── */}
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
                    placeholder={chatMode === 'ai' ? 'Tanya Asisten AI...' : (connected ? 'Ketik pesan...' : 'Koneksi terputus...')}
                    disabled={chatMode === 'owner' && !connected}
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
                  disabled={!inputText.trim() || (chatMode === 'owner' && !connected) || inputText.length > MAX_MESSAGE_LENGTH}
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-30 shrink-0"
                  style={{ background: 'var(--primary)', color: '#ffffff' }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--primary-dark)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)' }}
                  aria-label="Kirim pesan"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Character counter */}
              {isNearLimit && (
                <div className="px-4 pb-2 text-right">
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
