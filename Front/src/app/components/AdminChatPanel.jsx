import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, Search, User, Sparkles, Trash2 } from 'lucide-react'
import { Button } from './Button'
import { getSocket } from '../../realtime/socketClient'
import { RealtimeEvents } from '../../realtime/events'
import { useSocket } from '../../context/SocketContext'

export function AdminChatPanel() {
  const { connected } = useSocket()
  const [threads, setThreads] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedUserName, setSelectedUserName] = useState('')
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const messagesEndRef = useRef(null)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (selectedUserId) {
      scrollToBottom()
    }
  }, [messages, selectedUserId])

  // Track online users list
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleUserOnline = (payload) => {
      if (payload?.userId) {
        setOnlineUserIds((prev) => {
          const next = new Set(prev)
          next.add(Number(payload.userId))
          return next
        })
      }
    }

    const handleUserOffline = (payload) => {
      if (payload?.userId) {
        setOnlineUserIds((prev) => {
          const next = new Set(prev)
          next.delete(Number(payload.userId))
          return next
        })
      }
    }

    const initOnlineList = () => {
      socket.emit('presence:get_online_users', {}, (res) => {
        if (res && Array.isArray(res.users)) {
          const ids = res.users.map((u) => Number(u.userId))
          setOnlineUserIds(new Set(ids))
        }
      })
    }

    if (socket.connected) {
      initOnlineList()
    }
    socket.on('connect', initOnlineList)
    socket.on(RealtimeEvents.USER_ONLINE, handleUserOnline)
    socket.on(RealtimeEvents.USER_OFFLINE, handleUserOffline)

    return () => {
      socket.off('connect', initOnlineList)
      socket.off(RealtimeEvents.USER_ONLINE, handleUserOnline)
      socket.off(RealtimeEvents.USER_OFFLINE, handleUserOffline)
    }
  }, [connected])

  // Initial load of threads & register listeners
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // Retry fetch threads when socket connects
    const doFetch = () => {
      socket.emit(RealtimeEvents.CHAT_GET_THREADS, {}, (threadsList) => {
        if (Array.isArray(threadsList)) {
          setThreads(threadsList)
        }
      })
    }

    // Fetch active chat threads (with retry on connect)
    if (socket.connected) {
      doFetch()
    }
    socket.on('connect', doFetch)

    // Listen for thread list updates
    const handleThreadsUpdate = (updatedThreads) => {
      if (Array.isArray(updatedThreads)) {
        setThreads(updatedThreads)
      }
    }

    // Listen for new messages
    const handleNewMessage = (msg) => {
      // Append if it's the active conversation
      if (selectedUserId && msg.userId === selectedUserId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }
    }

    const handleSessionDeleted = ({ userId }) => {
      if (selectedUserId === Number(userId)) {
        setMessages([])
      }
    }

    const handleAllDeleted = () => {
      setMessages([])
      setThreads([])
      setSelectedUserId(null)
      setSelectedUserName('')
    }

    socket.on(RealtimeEvents.CHAT_THREAD_UPDATED, handleThreadsUpdate)
    socket.on(RealtimeEvents.CHAT_MESSAGE_RECEIVED, handleNewMessage)
    socket.on('chat:session_deleted', handleSessionDeleted)
    socket.on('chat:all_deleted', handleAllDeleted)

    return () => {
      socket.off('connect', doFetch)
      socket.off(RealtimeEvents.CHAT_THREAD_UPDATED, handleThreadsUpdate)
      socket.off(RealtimeEvents.CHAT_MESSAGE_RECEIVED, handleNewMessage)
      socket.off('chat:session_deleted', handleSessionDeleted)
      socket.off('chat:all_deleted', handleAllDeleted)
    }
  }, [selectedUserId])

  // Load history when selected user changes
  useEffect(() => {
    if (!selectedUserId) {
      setMessages([])
      return
    }

    const socket = getSocket()
    if (!socket) return

    socket.emit(RealtimeEvents.CHAT_GET_HISTORY, { userId: selectedUserId }, (history) => {
      if (Array.isArray(history)) {
        setMessages(history)
      }
    })
  }, [selectedUserId])

  const handleDeleteSession = () => {
    if (!selectedUserId) return
    if (!window.confirm(`Apakah Anda yakin ingin menghapus seluruh sesi obrolan dengan ${selectedUserName}? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }
    const socket = getSocket()
    if (!socket) return
    socket.emit('chat:delete_session', { userId: selectedUserId }, (res) => {
      if (res?.ok) {
        setMessages([])
      }
    })
  }

  const handleDeleteAllChats = () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat chat dari semua user? Tindakan ini tidak dapat dibatalkan.")) {
      return
    }
    const socket = getSocket()
    if (!socket) return
    socket.emit('chat:delete_all', {}, (res) => {
      if (res?.ok) {
        setMessages([])
        setThreads([])
        setSelectedUserId(null)
        setSelectedUserName('')
      }
    })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedUserId) return

    const socket = getSocket()
    if (!socket || !connected) return

    const textToSend = inputText.trim()
    setInputText('')

    socket.emit(
      RealtimeEvents.CHAT_SEND_MESSAGE,
      { userId: selectedUserId, text: textToSend },
      (res) => {
        if (res?.ok && res.message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === res.message.id)) return prev
            return [...prev, res.message]
          })
        }
      },
    )
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return ''
    }
  }

  const formatDateTime = (isoString) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (e) {
      return ''
    }
  }

  const filteredThreads = threads.filter((t) =>
    (t.userName || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm h-[600px] grid grid-cols-1 md:grid-cols-[290px_1fr]">
      {/* Left Pane: Threads Sidebar */}
      <div className="border-r border-border flex flex-col h-full bg-stone-50/30 min-h-0">
        <div className="p-4.5 border-b border-border bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Pesan Masuk</h3>
            <button
              type="button"
              onClick={handleDeleteAllChats}
              className="text-[10px] text-destructive hover:underline font-semibold cursor-pointer"
            >
              Hapus Semua Chat
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Cari penghuni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-stone-100 border border-transparent rounded-xl text-xs focus:outline-none focus:bg-white focus:border-border focus:ring-1 focus:ring-ring transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {filteredThreads.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada obrolan aktif.'}
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isSelected = selectedUserId === thread.userId
              const isUserOnline = onlineUserIds.has(Number(thread.userId))
              return (
                <button
                  key={thread.userId}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(thread.userId)
                    setSelectedUserName(thread.userName)
                  }}
                  className={`w-full text-left p-4 flex gap-3 items-start transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-inner'
                      : 'hover:bg-surface-warm/40 bg-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold shadow-sm ${
                        isSelected
                          ? 'bg-white/15 text-white'
                          : 'bg-[#EDE8DC] text-[#412D15]'
                      }`}
                    >
                      {getInitials(thread.userName)}
                    </span>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                        isUserOnline ? 'bg-emerald-500' : 'bg-stone-300'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-xs truncate pr-1">
                        {thread.userName}
                      </span>
                      <span
                        className={`text-[9px] ${
                          isSelected ? 'text-[#EDE8DC]/80' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(thread.timestamp)}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] truncate leading-tight ${
                        isSelected ? 'text-[#EDE8DC]/70' : 'text-muted-foreground'
                      }`}
                    >
                      {thread.lastMessage}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right Pane: Chat History */}
      <div className="flex flex-col h-full bg-stone-50/20 min-h-0">
        {selectedUserId ? (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-border bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xs font-extrabold shadow-md">
                  {getInitials(selectedUserName)}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{selectedUserName}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        onlineUserIds.has(Number(selectedUserId))
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-stone-400'
                      }`}
                    />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {onlineUserIds.has(Number(selectedUserId)) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDeleteSession}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus Sesi Chat
                </button>
                <span className="text-xs text-muted-foreground font-medium bg-stone-100 border border-stone-200/50 px-2 py-0.5 rounded-md">
                  User ID: #{selectedUserId}
                </span>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/50">
              {messages.map((msg) => {
                const isAdmin = msg.role === 'admin'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                        isAdmin
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-card border border-border text-[#1F150C] rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-muted-foreground/80 mt-1 px-1">
                      {formatDateTime(msg.timestamp)}
                    </span>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-border p-4 flex gap-3 items-center bg-white"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={connected ? 'Ketik tanggapan Anda...' : 'Menghubungkan kembali...'}
                disabled={!connected}
                className="flex-1 bg-stone-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring border border-transparent focus:bg-white focus:border-border transition-all"
              />
              <Button
                type="submit"
                disabled={!inputText.trim() || !connected}
                variant="primary"
                size="sm"
                className="rounded-xl px-4 py-2.5 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" /> Balas
              </Button>
            </form>
          </>
        ) : (
          /* Unselected State */
          <div className="flex flex-col items-center justify-center h-full text-center px-8 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage/20 border border-sage/30 text-primary shadow-inner">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Ruang Chat Pengelola</h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-2 leading-relaxed">
                Pilih salah satu penghuni di daftar sebelah kiri untuk membalas pertanyaan atau keluhan fasilitas secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#4a7c59] bg-[#f0f2ec] border border-[#B0BA99]/30 px-3.5 py-1.5 rounded-full font-medium">
              <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
              Notifikasi chat baru akan muncul otomatis secara instan.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

