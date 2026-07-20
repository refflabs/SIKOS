import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, Send, X, MessageCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useRoomsQuery } from '../../hooks/queries'
import { CONTACT_WHATSAPP } from '../../constants'

/* ─── Config ─── */
const MAX_MESSAGE_LENGTH = 500

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

/* ─── Simple Markdown / Bold Asterisks Stripper ─── */
function renderFormattedText(text) {
  if (!text) return ''
  // Hapus semua tanda bintang ganda (**) agar terlihat seperti teks biasa manusia
  return text.replace(/\*\*/g, '')
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
          className="w-[190px] bg-card rounded-2xl border overflow-hidden shrink-0 shadow-sm flex flex-col"
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
                href={`/room-detail?id=${room.id}`}
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
          href={`https://wa.me/${CONTACT_WHATSAPP}?text=Halo%20Pak%20RT,%20saya%20tertarik%20dengan%20Kost%20Pak%20RT.`}
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
  const [isOpen, setIsOpen] = useState(false)
  
  const [messages, setMessages] = useState([
    {
      id: 'welcome-orion',
      text: 'Halo! Saya adalah Orion, asisten virtual untuk SIKOS. Saya bisa mencarikan kamar kosong, memberi tahu info seputar harga sewa, fasilitas, lokasi, hingga memandu Anda cara melakukan booking secara otomatis. Ada yang ingin ditanyakan? 😊',
      role: 'admin',
      timestamp: new Date().toISOString(),
      isAutoReply: true,
    }
  ])
  
  const [inputText, setInputText] = useState('')
  const [aiTyping, setAiTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Don't render for admin users
  if (user?.role === 'admin') return null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [isOpen, messages, aiTyping])

  const handleSendMessage = (e) => {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed) return
    if (trimmed.length > MAX_MESSAGE_LENGTH) return

    setInputText('')
    handleSendAiMessage(trimmed)
  }

  const handleSendAiMessage = async (trimmed) => {
    const userMsg = {
      id: `user-ai-${Date.now()}`,
      text: trimmed,
      role: user?.role || 'tenant',
      userId: user?.id,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setAiTyping(true)

    // Build context history (last 6 messages)
    const history = [...messages, userMsg]
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
      setMessages(prev => [...prev, {
        id: `ai-reply-${Date.now()}`,
        text: data.reply,
        role: 'admin',
        timestamp: new Date().toISOString(),
        isAutoReply: true,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `ai-reply-fallback-${Date.now()}`,
        text: 'Maaf, koneksi ke asisten virtual Orion terputus saat ini. Silakan coba beberapa saat lagi atau hubungi Pak RT.',
        role: 'admin',
        timestamp: new Date().toISOString(),
        isAutoReply: true,
      }])
    } finally {
      setAiTyping(false)
      inputRef.current?.focus()
    }
  }

  const formatTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const charsLeft = MAX_MESSAGE_LENGTH - inputText.length
  const isNearLimit = charsLeft <= 80

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* ── FAB Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="flex h-13 w-13 items-center justify-center rounded-full text-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.03]"
        style={{
          background: 'var(--primary)',
          boxShadow: '0 4px 18px rgba(107,143,113,0.3)',
        }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
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
                  AI
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold leading-tight text-white flex items-center gap-1.5">
                  Asisten Orion
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
                </h4>
                <span className="text-[10px] font-medium" style={{ color: '#86efac' }}>
                  Aktif
                </span>
              </div>
            </div>

            {/* WA Link */}
            <a
              href={`https://wa.me/${CONTACT_WHATSAPP}?text=Halo%20Pak%20RT,%20saya%20butuh%20bantuan%20terkait%20kost.`}
              target="_blank"
              rel="noopener noreferrer"
              title="Hubungi Pak RT via WhatsApp"
              className="p-2 rounded-xl transition-colors cursor-pointer"
              style={{ color: '#86efac', background: 'rgba(134,239,172,0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(134,239,172,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(134,239,172,0.15)' }}
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </a>
          </div>

          {/* ── Suggestion Chips (shows on start) ── */}
          {messages.length <= 1 && (
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
            {messages.map((msg) => {
              const isAdmin = msg.role === 'admin'
              const { cleanText, activeWidget } = parseWidgetTag(msg.text)
              return (
                <div key={msg.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                    {msg.isAutoReply && (
                      <span className="text-[9px] mb-0.5 px-1 font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                        Orion
                        <Sparkles className="h-2.5 w-2.5 text-yellow-500" />
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

                    {/* Render Interactive Actions Widget */}
                    {activeWidget === 'ROOMS_CAROUSEL' && <RoomsCarouselWidget />}
                    {activeWidget === 'CONTACT_CARD' && <ContactCardWidget />}
                    {activeWidget === 'BOOKING_WIDGET' && <BookingWidget />}

                    {/* Time stamp */}
                    <div className="flex items-center gap-1 mt-0.5 px-1">
                      <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

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
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Footer ── */}
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
                  placeholder="Tanya Orion..."
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
                disabled={!inputText.trim() || inputText.length > MAX_MESSAGE_LENGTH}
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
                  {charsLeft} karakter &bull; limit 500
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
