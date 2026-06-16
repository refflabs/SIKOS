import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, MessageCircle, ExternalLink, HelpCircle } from 'lucide-react'
import { Button } from './Button'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getSocket } from '../../realtime/socketClient'
import { RealtimeEvents } from '../../realtime/events'

export function ChatWidget() {
  const { user } = useAuth()
  const { connected } = useSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [unread, setUnread] = useState(false)
  const messagesEndRef = useRef(null)

  // If user is Admin, they should use the Admin Dashboard Chat panel instead
  if (user?.role === 'admin') {
    return null
  }

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnread(false)
    }
  }, [messages, isOpen])

  // Load history and setup listener
  useEffect(() => {
    if (!user) {
      setMessages([])
      return
    }

    const socket = getSocket()
    if (!socket) return

    // Load initial history
    socket.emit(RealtimeEvents.CHAT_GET_HISTORY, {}, (history) => {
      if (Array.isArray(history)) {
        setMessages(history)
      }
    })

    // Listen to new messages
    const handleNewMessage = (msg) => {
      if (msg.userId === user.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        if (!isOpen) {
          setUnread(true)
        }
      }
    }

    socket.on(RealtimeEvents.CHAT_MESSAGE_RECEIVED, handleNewMessage)

    return () => {
      socket.off(RealtimeEvents.CHAT_MESSAGE_RECEIVED, handleNewMessage)
    }
  }, [user, isOpen])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const socket = getSocket()
    if (!socket || !connected) return

    const textToSend = inputText.trim()
    setInputText('')

    socket.emit(RealtimeEvents.CHAT_SEND_MESSAGE, { text: textToSend }, (res) => {
      if (res?.ok && res.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id)) return prev
          return [...prev, res.message]
        })
      }
    })
  }

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return ''
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-white shadow-xl hover:bg-stone-800 transition-transform active:scale-95 duration-200"
        aria-label="Tanya Pak RT"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {unread && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white"></span>
          </span>
        )}
      </button>

      {/* Chat window panel */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] flex flex-col rounded-2xl border border-border bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-stone-900 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white font-bold text-sm">
                RT
              </span>
              <div>
                <h4 className="text-sm font-semibold leading-tight">Chat dengan Pak RT</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      connected ? 'bg-emerald-400' : 'bg-stone-400'
                    }`}
                  />
                  <span className="text-[10px] text-stone-300">
                    {connected ? 'Hubungan Aktif' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20saya%20butuh%20bantuan%20terkait%20kost."
              target="_blank"
              rel="noopener noreferrer"
              title="Hubungi via WhatsApp"
              className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>

          {/* Body */}
          <div className="flex-1 bg-stone-50 overflow-y-auto p-4 space-y-4">
            {!user ? (
              /* Guest layout */
              <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-foreground">Hubungi Pengelola SIKOS</h5>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Silakan masuk ke akun Anda terlebih dahulu untuk memulai obrolan langsung dengan Pak RT.
                  </p>
                </div>
                <div className="w-full pt-2 space-y-2">
                  <a href="/login" className="block w-full">
                    <Button variant="primary" className="w-full justify-center text-xs py-2">
                      Masuk Ke Akun
                    </Button>
                  </a>
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20saya%20ingin%20tanya%20tentang%20kost."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full justify-center text-xs py-2 gap-1.5">
                      Hubungi WhatsApp <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            ) : messages.length === 0 ? (
              /* Empty Chat state */
              <div className="flex flex-col items-center justify-center h-full text-center px-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-muted-foreground">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-foreground">Belum ada percakapan</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Kirim pesan pertama Anda di bawah untuk berkonsultasi mengenai sewa kamar atau fasilitas kost dengan Pak RT.
                  </p>
                </div>
              </div>
            ) : (
              /* Message List */
              messages.map((msg) => {
                const isAdmin = msg.role === 'admin'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                        isAdmin
                          ? 'bg-white border border-border text-foreground rounded-tl-none'
                          : 'bg-teal-600 text-white rounded-tr-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1 px-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Footer */}
          {user && (
            <form
              onSubmit={handleSendMessage}
              className="border-t border-border p-3 flex gap-2 items-center bg-white"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={connected ? 'Ketik pesan...' : 'Koneksi terputus...'}
                disabled={!connected}
                className="flex-1 bg-stone-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring border border-transparent focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || !connected}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 transition-colors"
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
