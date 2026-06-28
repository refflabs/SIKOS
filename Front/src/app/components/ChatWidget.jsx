import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, Send, X, MessageCircle, HelpCircle, Check, CheckCheck } from 'lucide-react'
import { Button } from './Button'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getSocket } from '../../realtime/socketClient'
import { RealtimeEvents } from '../../realtime/events'

/* ─── Palette ─── */
const C = {
  mocca: '#412D15',
  moccaDark: '#2e1e0a',
  sage: '#B0BA99',
  beige: '#E1DCC9',
  coffee: '#1F150C',
  muted: '#7a6247',
  border: '#D8D0BE',
  card: '#FDFCF9',
  bg: '#F7F4EE',
}

/* ─── Read Receipt Icon ─── */
function ReadReceipt({ status }) {
  // status: 'sending' | 'sent' | 'delivered' | 'read'
  if (status === 'sending') {
    return <Check className="h-3 w-3 opacity-40" style={{ color: C.beige }} />
  }
  if (status === 'sent') {
    return <Check className="h-3 w-3" style={{ color: C.beige }} />
  }
  if (status === 'delivered') {
    return <CheckCheck className="h-3 w-3" style={{ color: C.beige }} />
  }
  if (status === 'read') {
    return <CheckCheck className="h-3 w-3" style={{ color: C.sage }} />
  }
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
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Admin → user → not admin
  if (user?.role === 'admin') return null

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnreadCount(0)

      // Mark messages as read when opening chat
      const socket = getSocket()
      if (socket && user) {
        socket.emit(RealtimeEvents.CHAT_MARK_READ, {})
        // Mark all outgoing as read locally
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

    // Load history (only when socket is connected)
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

    // Re-load when socket reconnects
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

    // New incoming message
    const handleNewMessage = (msg) => {
      if (msg.userId === user.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev
          const enriched = {
            ...msg,
            status: msg.role !== 'admin' ? 'delivered' : undefined,
          }
          return [...prev, enriched]
        })
        if (!isOpen) {
          setUnreadCount(c => c + 1)
        }
      }
    }

    // Admin online / offline — only react when the role is admin
    const handleAdminOnline = (payload) => {
      if (!payload || payload.role === 'admin') setAdminOnline(true)
    }
    const handleAdminOffline = (payload) => {
      if (!payload || payload.role === 'admin') setAdminOnline(false)
    }

    // Admin read our message → update status to 'read'
    const handleMessageRead = ({ messageId }) => {
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, status: 'read' } : m))
      )
    }

    const handleSessionDeleted = ({ userId }) => {
      if (user && Number(userId) === user.id) {
        setMessages([])
      }
    }

    const handleAllDeleted = () => {
      setMessages([])
    }

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

  /* ── Send message ── */
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const socket = getSocket()
    if (!socket || !connected) return

    const textToSend = inputText.trim()
    setInputText('')

    // Optimistic local message
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId,
      text: textToSend,
      role: user.role,
      userId: user.id,
      timestamp: new Date().toISOString(),
      status: 'sending',
    }
    setMessages(prev => [...prev, optimistic])

    socket.emit(RealtimeEvents.CHAT_SEND_MESSAGE, { text: textToSend }, (res) => {
      if (res?.ok && res.message) {
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempId)
          if (filtered.some(m => m.id === res.message.id)) return filtered
          return [...filtered, { ...res.message, status: 'sent' }]
        })
      }
    })

    inputRef.current?.focus()
  }

  const formatTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  /* ── Status label ── */
  const statusLabel = adminOnline
    ? 'Online'
    : connected
    ? 'Offline'
    : 'Menghubungkan...'

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* ── FAB ── */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${C.mocca}, ${C.moccaDark})`,
          boxShadow: '0 8px 24px rgba(65,45,21,0.4)',
          color: C.beige,
        }}
        aria-label="Chat dengan Pak RT"
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ background: '#ef4444', color: '#fff', border: '2px solid #fff' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className="absolute bottom-18 right-0 w-[350px] sm:w-[390px] flex flex-col rounded-3xl overflow-hidden"
          style={{
            height: '520px',
            maxHeight: '82vh',
            boxShadow: '0 24px 60px rgba(31,21,12,0.28)',
            border: `1px solid ${C.border}`,
            background: C.card,
            // animate in
            animation: 'chatSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <style>{`
            @keyframes chatSlideIn {
              from { opacity: 0; transform: translateY(16px) scale(0.96); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{
              background: `linear-gradient(135deg, ${C.mocca} 0%, ${C.moccaDark} 100%)`,
              borderBottom: `1px solid rgba(176,186,153,0.15)`,
            }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative shrink-0">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-2xl font-bold text-sm"
                  style={{ background: 'rgba(176,186,153,0.2)', color: C.beige }}
                >
                  RT
                </span>
                {/* Online dot on avatar */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                  style={{ background: C.moccaDark }}
                >
                  <OnlineDot online={adminOnline} />
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold leading-tight" style={{ color: C.beige }}>
                  Pak RT
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium" style={{ color: adminOnline ? '#4ade80' : '#9ca3af' }}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* WA link */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20saya%20butuh%20bantuan%20terkait%20kost."
              target="_blank"
              rel="noopener noreferrer"
              title="Hubungi via WhatsApp"
              className="p-2 rounded-xl transition-colors cursor-pointer"
              style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.1)' }}
            >
              <MessageCircle className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </a>
          </div>

          {/* ── Messages body ── */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ background: C.bg }}
          >
            {!user ? (
              /* Guest */
              <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(176,186,153,0.18)', color: C.sage }}
                >
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-bold text-sm" style={{ color: C.coffee }}>Hubungi Pak RT</h5>
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: C.muted }}>
                    Masuk ke akun Anda untuk mulai chat langsung dengan pengelola kost.
                  </p>
                </div>
                <div className="w-full pt-2 space-y-2">
                  <a href="/login" className="block w-full">
                    <button
                      className="w-full py-2.5 rounded-xl text-xs font-bold"
                      style={{ background: `linear-gradient(135deg,${C.mocca},${C.moccaDark})`, color: C.beige }}
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
                      className="w-full py-2.5 rounded-xl text-xs font-semibold"
                      style={{ border: `1.5px solid ${C.border}`, color: C.mocca, background: 'transparent' }}
                    >
                      Hubungi via WhatsApp ↗
                    </button>
                  </a>
                </div>
              </div>
            ) : messages.length === 0 ? (
              /* Empty */
              <div className="flex flex-col items-center justify-center h-full text-center px-6 space-y-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(176,186,153,0.15)', color: C.sage }}
                >
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-xs" style={{ color: C.coffee }}>Belum ada percakapan</p>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.muted }}>
                    Kirim pesan pertama untuk berkonsultasi dengan Pak RT.
                  </p>
                </div>
              </div>
            ) : (
              /* Message list */
              messages.map((msg) => {
                const isAdmin = msg.role === 'admin'
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                      <div
                        className="px-3.5 py-2 text-xs leading-relaxed"
                        style={{
                          borderRadius: isAdmin
                            ? '4px 16px 16px 16px'
                            : '16px 4px 16px 16px',
                          background: isAdmin ? C.card : C.mocca,
                          color: isAdmin ? C.coffee : C.beige,
                          boxShadow: isAdmin
                            ? `0 1px 4px rgba(31,21,12,0.08), 0 0 0 1px ${C.border}`
                            : '0 2px 8px rgba(65,45,21,0.25)',
                        }}
                      >
                        {msg.text}
                      </div>

                      {/* Time + read receipt */}
                      <div className="flex items-center gap-1 mt-0.5 px-1">
                        <span className="text-[9px]" style={{ color: C.muted }}>
                          {formatTime(msg.timestamp)}
                        </span>
                        {!isAdmin && msg.status && (
                          <ReadReceipt status={msg.status} />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input footer ── */}
          {user && (
            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 items-center p-3"
              style={{ borderTop: `1px solid ${C.border}`, background: C.card }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={connected ? 'Ketik pesan...' : 'Koneksi terputus...'}
                disabled={!connected}
                className="flex-1 text-xs px-4 py-2.5 rounded-2xl focus:outline-none transition-all duration-200"
                style={{
                  background: C.bg,
                  border: `1.5px solid ${C.border}`,
                  color: C.coffee,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = C.sage }}
                onBlur={e => { e.currentTarget.style.borderColor = C.border }}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || !connected}
                className="flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-30 shrink-0"
                style={{ background: `linear-gradient(135deg,${C.mocca},${C.moccaDark})`, color: C.beige }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = 'scale(1.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
