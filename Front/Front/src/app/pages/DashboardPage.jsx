import { useEffect, useMemo, useState } from 'react'
import { Building2, CalendarDays, DoorOpen, Inbox, Save, Sparkles, Phone, MapPin, Eye, Settings, Shield, MessageSquare, ArrowRight, Pencil, Plus, Trash2, Upload, Users, ArrowUpDown, ArrowUp, ArrowDown, BookOpen } from 'lucide-react'
import { AdminLayout } from '../layouts/AdminLayout'
import { StatCard } from '../components/StatCard'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { LedgerView } from '../components/LedgerView'
import { DatePicker } from '../components/DatePicker'
import { 
  useRoomsQuery, 
  useBookingsQuery, 
  useCreateRoomMutation, 
  useUpdateRoomMutation, 
  useDeleteRoomMutation,
  useUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation,
  useHandleBookingRenewalActionMutation
} from '../../hooks/queries'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../api/roomUtils'
import { DashboardSkeleton } from '../../components/skeletons/DashboardSkeleton'
import { QueryError } from '../../components/QueryError'
import { useSocket } from '../../context/SocketContext'
import { getSocket } from '../../realtime/socketClient'
import { AdminChatPanel } from '../components/AdminChatPanel'
import { AdminPaymentsReport } from '../components/AdminPaymentsReport'
import { toast } from 'sonner'
import { uploadRoomImage } from '../../api/rooms'
import { getBookingById } from '../../api/bookings'

function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
      <span className="text-[11px] text-muted-foreground">
        Menampilkan <strong className="text-foreground">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</strong> - <strong className="text-foreground">{Math.min(currentPage * itemsPerPage, totalItems)}</strong> dari <strong className="text-foreground">{totalItems}</strong> data
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-secondary disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Sebelumnya
        </button>
        {Array.from({ length: totalPages }).map((_, idx) => {
          const page = idx + 1
          const isCurrent = currentPage === page
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isCurrent 
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-border hover:bg-secondary text-foreground'
              }`}
            >
              {page}
            </button>
          )
        })}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-secondary disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  )
}

export function DashboardPage({ search = '' }) {
  const tab = new URLSearchParams(search).get('tab') || 'overview'
  const { user } = useAuth()
  const { refreshSubscriptions, connected } = useSocket()
  const [viewingReceipt, setViewingReceipt] = useState(null)

  const handleViewReceipt = async (bookingId) => {
    setViewingReceipt('loading')
    try {
      const data = await getBookingById(bookingId)
      setViewingReceipt(data.payment_receipt || 'no_receipt')
    } catch (err) {
      toast.error('Gagal memuat bukti pembayaran')
      setViewingReceipt(null)
    }
  }

  // State for filtering
  const [roomFilter, setRoomFilter] = useState('all')
  const [bookingFilter, setBookingFilter] = useState('all')
  const [bookingsSubTab, setBookingsSubTab] = useState('list') // 'list' | 'ledger'

  // State for managing rooms modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [selectedRoom, setSelectedRoom] = useState(null)

  // Form fields for room
  const [formRoomName, setFormRoomName] = useState('')
  const [formRoomType, setFormRoomType] = useState('kosongan')
  const [formRoomPrice, setFormRoomPrice] = useState(0)
  const [formRoomFloor, setFormRoomFloor] = useState(1)
  const [formRoomSize, setFormRoomSize] = useState('3x4 m')
  const [formRoomStatus, setFormRoomStatus] = useState('available')
  const [formRoomDescription, setFormRoomDescription] = useState('')
  const [formRoomImage, setFormRoomImage] = useState('')
  const [formRoomCapacity, setFormRoomCapacity] = useState(10)
  const [formRoomStock, setFormRoomStock] = useState(10)

  // State for managing users
  const [userSearch, setUserSearch] = useState('')
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  
  // User Form fields
  const [formUserName, setFormUserName] = useState('')
  const [formUserEmail, setFormUserEmail] = useState('')
  const [formUserPhone, setFormUserPhone] = useState('')
  const [formUserAddress, setFormUserAddress] = useState('')
  const [formUserPassword, setFormUserPassword] = useState('')

  // State for managing bookings modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  // Booking Form fields
  const [formBookingRoomId, setFormBookingRoomId] = useState('')
  const [formBookingCheckIn, setFormBookingCheckIn] = useState('')
  const [formBookingDuration, setFormBookingDuration] = useState(1)
  const [formBookingNotes, setFormBookingNotes] = useState('')
  const [formBookingOccupants, setFormBookingOccupants] = useState(1)

  // State for settings
  const [kostName, setKostName] = useState('Kost Pak RT')
  const [kostAddress, setKostAddress] = useState('Jalan Raya Mocca No. 12, Jakarta Selatan')
  const [kostPhone, setKostPhone] = useState('081234567890')
  const [soundNotify, setSoundNotify] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Pagination states
  const [roomPage, setRoomPage] = useState(1)
  const [bookingPage, setBookingPage] = useState(1)
  const [clientPage, setClientPage] = useState(1)

  // Sort states for Users table
  const [userSortKey, setUserSortKey] = useState(null)
  const [userSortDir, setUserSortDir] = useState('asc')

  // Sort states for Bookings list
  const [bookingSortKey, setBookingSortKey] = useState(null)
  const [bookingSortDir, setBookingSortDir] = useState('asc')

  const handleUserSort = (key) => {
    if (userSortKey === key) {
      setUserSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setUserSortKey(key)
      setUserSortDir('asc')
    }
  }

  const handleBookingSort = (key) => {
    if (bookingSortKey === key) {
      setBookingSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setBookingSortKey(key)
      setBookingSortDir('asc')
    }
  }

  const UserSortIcon = ({ colKey }) => {
    if (userSortKey !== colKey) return <ArrowUpDown className="h-3 w-3 opacity-30" />
    return userSortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 text-primary" />
      : <ArrowDown className="h-3 w-3 text-primary" />
  }

  const BookingSortIcon = ({ colKey }) => {
    if (bookingSortKey !== colKey) return <ArrowUpDown className="h-3 w-3 opacity-30" />
    return bookingSortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 text-primary" />
      : <ArrowDown className="h-3 w-3 text-primary" />
  }

  // Reset pages when filters change
  useEffect(() => {
    setRoomPage(1)
  }, [roomFilter])

  useEffect(() => {
    setBookingPage(1)
  }, [bookingFilter])

  useEffect(() => {
    setClientPage(1)
  }, [userSearch])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const toastId = toast.loading('Mengunggah gambar kamar...')
    try {
      const res = await uploadRoomImage(file)
      setFormRoomImage(res.url)
      toast.success('Gambar berhasil diunggah!', {
        id: toastId,
        description: 'URL gambar kamar telah diperbarui.',
      })
    } catch (err) {
      toast.error('Gagal mengunggah gambar: ' + (err.response?.data?.message || err.message), {
        id: toastId,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const roomsQuery = useRoomsQuery()
  const bookingsQuery = useBookingsQuery()
  const usersQuery = useUsersQuery()

  // Track online users list
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())

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
    socket.on('user:online', handleUserOnline)
    socket.on('user:offline', handleUserOffline)

    return () => {
      socket.off('connect', initOnlineList)
      socket.off('user:online', handleUserOnline)
      socket.off('user:offline', handleUserOffline)
    }
  }, [connected])

  // Room mutations
  const createRoomMutation = useCreateRoomMutation()
  const updateRoomMutation = useUpdateRoomMutation()
  const deleteRoomMutation = useDeleteRoomMutation()
  
  // User mutations
  const updateUserMutation = useUpdateUserMutation()
  const deleteUserMutation = useDeleteUserMutation()

  // Booking mutations
  const updateBookingStatusMutation = useUpdateBookingStatusMutation()
  const deleteBookingMutation = useDeleteBookingMutation()

  const handleBookingRenewalActionMutation = useHandleBookingRenewalActionMutation()

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await updateBookingStatusMutation.mutateAsync({ id, status })
      toast.success(status === 'accepted' ? 'Pemesanan disetujui!' : 'Pemesanan ditolak!')
    } catch (err) {
      toast.error('Gagal memperbarui status pemesanan.')
    }
  }

  const handleRenewalAction = async (id, action) => {
    try {
      await handleBookingRenewalActionMutation.mutateAsync({ id, action })
      toast.success(action === 'approve' ? 'Perpanjangan sewa disetujui!' : 'Perpanjangan sewa ditolak!')
    } catch (err) {
      toast.error('Gagal memproses perpanjangan sewa.')
    }
  }

  const handleOpenBookingEditModal = (b) => {
    setSelectedBooking(b)
    setFormBookingRoomId(b.room_id)
    const checkInDate = b.check_in ? String(b.check_in).slice(0, 10) : ''
    setFormBookingCheckIn(checkInDate)
    setFormBookingDuration(b.duration_months || 1)
    setFormBookingNotes(b.notes || '')
    setFormBookingOccupants(b.occupant_count || 1)
    setIsBookingModalOpen(true)
  }

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false)
    setSelectedBooking(null)
  }

  const handleSaveBookingEdit = async (e) => {
    e.preventDefault()
    if (!selectedBooking) return

    try {
      await updateBookingStatusMutation.mutateAsync({
        id: selectedBooking.id,
        room_id: Number(formBookingRoomId),
        check_in: formBookingCheckIn,
        duration_months: Number(formBookingDuration),
        occupant_count: Number(formBookingOccupants),
        notes: formBookingNotes,
      })
      toast.success('Pemesanan berhasil diperbarui!')
      handleCloseBookingModal()
    } catch (err) {
      toast.error('Gagal memperbarui pemesanan: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteBooking = async (b) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pemesanan kamar ${b.room?.name || 'Kost'} oleh ${b.user?.name || 'penghuni'}?`)) return
    try {
      await deleteBookingMutation.mutateAsync(b.id)
      toast.success('Pemesanan berhasil dihapus!')
    } catch (err) {
      toast.error('Gagal menghapus pemesanan: ' + (err.response?.data?.message || err.message))
    }
  }

  useEffect(() => {
    refreshSubscriptions()
  }, [refreshSubscriptions])

  const rooms = Array.isArray(roomsQuery.data) ? roomsQuery.data : []
  const bookings = Array.isArray(bookingsQuery.data) ? bookingsQuery.data : []

  const stats = useMemo(
    () => {
      const totalCapacity = rooms.reduce((sum, r) => sum + (Number(r.capacity) || 0), 0)
      const totalStock = rooms.reduce((sum, r) => sum + (Number(r.stock) ?? 0), 0)
      return {
        total: totalCapacity,
        available: totalStock,
        booked: Math.max(0, totalCapacity - totalStock),
        pendingBookings: bookings.filter((b) => b.status === 'pending').length,
      }
    },
    [rooms, bookings],
  )

  // Modal handlers
  const handleOpenAddModal = () => {
    setModalMode('add')
    setSelectedRoom(null)
    setFormRoomName('')
    setFormRoomType('kosongan')
    setFormRoomPrice(500000)
    setFormRoomFloor(1)
    setFormRoomSize('3x4 m')
    setFormRoomStatus('available')
    setFormRoomDescription('')
    setFormRoomImage('')
    setFormRoomCapacity(10)
    setFormRoomStock(10)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (room) => {
    setModalMode('edit')
    setSelectedRoom(room)
    setFormRoomName(room.name || '')
    setFormRoomType(room.type || 'kosongan')
    setFormRoomPrice(room.price || 0)
    setFormRoomFloor(room.floor || 1)
    setFormRoomSize(room.size || '3x4 m')
    setFormRoomStatus(room.status || 'available')
    setFormRoomDescription(room.description || '')
    setFormRoomImage(room.image || '')
    setFormRoomCapacity(room.capacity || 10)
    setFormRoomStock(room.stock || 10)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRoom(null)
  }

  const handleSubmitRoom = (e) => {
    e.preventDefault()
    const data = {
      name: formRoomName,
      type: formRoomType,
      price: Number(formRoomPrice),
      floor: Number(formRoomFloor),
      size: formRoomSize,
      status: formRoomStatus,
      description: formRoomDescription,
      image: formRoomImage,
      capacity: Number(formRoomCapacity),
      stock: Number(formRoomStock),
    }

    if (modalMode === 'add') {
      createRoomMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Kamar berhasil ditambahkan!', {
            description: `Kamar ${formRoomName} telah dimasukkan ke database kost.`,
            duration: 3000,
          })
          handleCloseModal()
        },
        onError: (err) => {
          toast.error('Gagal menambahkan kamar: ' + (err.response?.data?.message || err.message))
        }
      })
    } else {
      updateRoomMutation.mutate({ id: selectedRoom.id, data }, {
        onSuccess: () => {
          toast.success('Informasi kamar diperbarui!', {
            description: `Perubahan data kamar ${formRoomName} berhasil disimpan.`,
            duration: 3000,
          })
          handleCloseModal()
        },
        onError: (err) => {
          toast.error('Gagal memperbarui kamar: ' + (err.response?.data?.message || err.message))
        }
      })
    }
  }

  const handleDeleteRoom = () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedRoom.name}?`)) return
    
    deleteRoomMutation.mutate(selectedRoom.id, {
      onSuccess: () => {
        toast.success('Kamar berhasil dihapus!', {
          description: `Kamar ${selectedRoom.name} telah dihapus dari sistem.`,
          duration: 3000,
        })
        handleCloseModal()
      },
      onError: (err) => {
        toast.error('Gagal menghapus kamar: ' + (err.response?.data?.message || err.message))
      }
    })
  }

  const handleOpenUserEditModal = (usr) => {
    setSelectedUser(usr)
    setFormUserName(usr.name || '')
    setFormUserEmail(usr.email || '')
    setFormUserPhone(usr.phone || '')
    setFormUserAddress(usr.address || '')
    setFormUserPassword('')
    setIsUserModalOpen(true)
  }

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false)
    setSelectedUser(null)
  }

  const handleSubmitUser = (e) => {
    e.preventDefault()
    const data = {
      name: formUserName,
      email: formUserEmail,
      phone: formUserPhone,
      address: formUserAddress,
    }
    if (formUserPassword) {
      data.password = formUserPassword
    }

    updateUserMutation.mutate({ id: selectedUser.id, data }, {
      onSuccess: () => {
        toast.success('Data pengguna diperbarui!', {
          description: `Perubahan profil ${formUserName} berhasil disimpan.`,
          duration: 3000,
        })
        handleCloseUserModal()
      },
      onError: (err) => {
        toast.error('Gagal memperbarui pengguna: ' + (err.response?.data?.message || err.message))
      }
    })
  }

  const handleDeleteUser = (usr) => {
    if (usr.id === user?.id) {
      toast.error('Gagal menghapus: Anda tidak bisa menghapus akun Anda sendiri.')
      return
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${usr.name}? Semua data booking dan riwayat chat pengguna ini mungkin juga akan terpengaruh.`)) return

    deleteUserMutation.mutate(usr.id, {
      onSuccess: () => {
        toast.success('Pengguna berhasil dihapus!', {
          description: `Akun ${usr.name} telah dihapus dari sistem.`,
          duration: 3000,
        })
      },
      onError: (err) => {
        toast.error('Gagal menghapus pengguna: ' + (err.response?.data?.message || err.message))
      }
    })
  }

  const handleSaveSettings = (e) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Pengaturan berhasil disimpan!', {
        description: 'Konfigurasi profil kost & notifikasi telah diperbarui.',
        duration: 3000,
      })
    }, 800)
  }

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (roomFilter === 'all') return rooms
    return rooms.filter(r => r.status === roomFilter)
  }, [rooms, roomFilter])

  const paginatedRooms = useMemo(() => {
    return filteredRooms.slice((roomPage - 1) * 6, roomPage * 6)
  }, [filteredRooms, roomPage])

  // Filtered & sorted bookings
  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return bookings
    return bookings.filter(b => b.status === bookingFilter)
  }, [bookings, bookingFilter])

  const sortedBookings = useMemo(() => {
    if (!bookingSortKey) return filteredBookings
    return [...filteredBookings].sort((a, b) => {
      let va, vb
      switch (bookingSortKey) {
        case 'name': va = (a.user?.name || '').toLowerCase(); vb = (b.user?.name || '').toLowerCase(); break
        case 'total_price': va = Number(a.total_price) || 0; vb = Number(b.total_price) || 0; break
        case 'check_in': va = a.check_in || ''; vb = b.check_in || ''; break
        case 'status': va = a.status || ''; vb = b.status || ''; break
        default: return 0
      }
      if (va < vb) return bookingSortDir === 'asc' ? -1 : 1
      if (va > vb) return bookingSortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredBookings, bookingSortKey, bookingSortDir])

  const paginatedBookings = useMemo(() => {
    return sortedBookings.slice((bookingPage - 1) * 5, bookingPage * 5)
  }, [sortedBookings, bookingPage])

  // Filtered users
  const users = Array.isArray(usersQuery.data) ? usersQuery.data : []
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      return (
        (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone || '').toLowerCase().includes(userSearch.toLowerCase())
      )
    })
  }, [users, userSearch])

  const sortedUsers = useMemo(() => {
    if (!userSortKey) return filteredUsers
    return [...filteredUsers].sort((a, b) => {
      let va, vb
      switch (userSortKey) {
        case 'name': va = (a.name || '').toLowerCase(); vb = (b.name || '').toLowerCase(); break
        case 'phone': va = (a.phone || '').toLowerCase(); vb = (b.phone || '').toLowerCase(); break
        case 'status': va = onlineUserIds.has(a.id) ? 1 : 0; vb = onlineUserIds.has(b.id) ? 1 : 0; break
        case 'address': va = (a.address || '').toLowerCase(); vb = (b.address || '').toLowerCase(); break
        default: return 0
      }
      if (va < vb) return userSortDir === 'asc' ? -1 : 1
      if (va > vb) return userSortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredUsers, userSortKey, userSortDir, onlineUserIds])

  const paginatedUsers = useMemo(() => {
    return sortedUsers.slice((clientPage - 1) * 8, clientPage * 8)
  }, [sortedUsers, clientPage])

  const loading = roomsQuery.isLoading || bookingsQuery.isLoading || usersQuery.isLoading
  const error =
    roomsQuery.isError || bookingsQuery.isError || usersQuery.isError
      ? 'Gagal memuat data dashboard.'
      : ''

  const activeTab =
    tab === 'rooms'
      ? 'rooms'
      : tab === 'bookings'
      ? 'bookings'
      : tab === 'payments'
      ? 'payments'
      : tab === 'chats'
      ? 'chats'
      : tab === 'settings'
      ? 'settings'
      : tab === 'users'
      ? 'users'
      : 'overview'

  return (
    <AdminLayout activeTab={activeTab}>
      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <QueryError
          message={error}
          onRetry={() => {
            roomsQuery.refetch()
            bookingsQuery.refetch()
            usersQuery.refetch()
          }}
        />
      ) : activeTab === 'payments' ? (
        <AdminPaymentsReport />
      ) : activeTab === 'users' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary tracking-tight">Manajemen Penyewa (Client)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Kelola data diri, no WhatsApp, dan alamat penyewa kost.</p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <input
                type="text"
                placeholder="Cari nama, email, WA..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-[var(--input-background)] text-foreground w-56 shadow-sm"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center text-xs text-muted-foreground">
              Tidak ada penyewa ditemukan.
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary border-b border-border text-xs font-bold text-primary uppercase tracking-wider">
                      <th className="p-4 pl-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleUserSort('name')}>
                        <span className="inline-flex items-center gap-1">Nama / Email <UserSortIcon colKey="name" /></span>
                      </th>
                      <th className="p-4 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleUserSort('phone')}>
                        <span className="inline-flex items-center gap-1">WhatsApp / Telp <UserSortIcon colKey="phone" /></span>
                      </th>
                      <th className="p-4 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleUserSort('status')}>
                        <span className="inline-flex items-center gap-1">Status <UserSortIcon colKey="status" /></span>
                      </th>
                      <th className="p-4 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleUserSort('address')}>
                        <span className="inline-flex items-center gap-1">Alamat KTP / Asal <UserSortIcon colKey="address" /></span>
                      </th>
                      <th className="p-4 pr-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {paginatedUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-secondary/35 transition-colors">
                        <td className="p-4 pl-6">
                          <div>
                            <span className="font-bold text-foreground block">{usr.name}</span>
                            <span className="text-muted-foreground block text-[10px] mt-0.5">{usr.email}</span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-foreground">{usr.phone || '-'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            onlineUserIds.has(usr.id)
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-secondary text-stone-500 border border-border'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              onlineUserIds.has(usr.id) ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                            }`} />
                            {onlineUserIds.has(usr.id) ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="p-4 max-w-[200px] truncate" title={usr.address}>{usr.address || '-'}</td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenUserEditModal(usr)}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-[#d9e2d3] hover:bg-primary hover:text-white text-primary font-bold rounded-lg cursor-pointer shadow-sm active:scale-95 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(usr)}
                            disabled={usr.id === user?.id}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-bold rounded-lg cursor-pointer shadow-sm active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={clientPage}
                totalItems={filteredUsers.length}
                itemsPerPage={8}
                onPageChange={setClientPage}
              />
            </div>
          )}
        </div>
      ) : activeTab === 'chats' ? (
        <AdminChatPanel />
      ) : activeTab === 'settings' ? (
        <div className="max-w-3xl bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-secondary/50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-primary">Pengaturan Kost & Sistem</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Atur profil hunian dan notifikasi realtime.</p>
            </div>
            <Settings className="h-5 w-5 text-muted-foreground/75" />
          </div>

          <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">Profil Hunian</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Nama Kost</label>
                  <input
                    type="text"
                    value={kostName}
                    onChange={(e) => setKostName(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Nomor WA Pengelola</label>
                  <input
                    type="text"
                    value={kostPhone}
                    onChange={(e) => setKostPhone(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Alamat Kost</label>
                  <input
                    type="text"
                    value={kostAddress}
                    onChange={(e) => setKostAddress(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">Sistem & Realtime</h3>
              <div className="space-y-3.5">
                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundNotify}
                    onChange={(e) => setSoundNotify(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Notifikasi Suara Realtime</span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">Bunyikan nada notifikasi halus setiap ada pesan masuk atau booking baru.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Ringkasan Mingguan</span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">Kirimkan ringkasan occupancy rate dan laporan keuangan setiap akhir pekan ke email.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-primary text-primary-foreground hover:bg-primary-dark transition-all duration-200 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      ) : activeTab === 'bookings' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary tracking-tight">Semua Pemesanan Kamar</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Kelola booking aktif dari calon penghuni kost secara instan.</p>
            </div>
            
            <div className="flex items-center gap-1 bg-stone-200/80 dark:bg-stone-800/80 p-1.5 rounded-2xl border-2 border-stone-300/80 dark:border-stone-700/80 shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => setBookingsSubTab('list')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 select-none ${
                  bookingsSubTab === 'list' 
                    ? 'bg-primary text-white shadow-md scale-[1.02]' 
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-300/40 dark:hover:bg-stone-700/40 hover:text-foreground'
                }`}
              >
                <CalendarDays className={`h-4 w-4 ${bookingsSubTab === 'list' ? 'text-white' : 'text-stone-500'}`} />
                Daftar Booking
              </button>
              <button
                type="button"
                onClick={() => setBookingsSubTab('ledger')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 select-none ${
                  bookingsSubTab === 'ledger' 
                    ? 'bg-primary text-white shadow-md scale-[1.02]' 
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-300/40 dark:hover:bg-stone-700/40 hover:text-foreground'
                }`}
              >
                <BookOpen className={`h-4 w-4 ${bookingsSubTab === 'ledger' ? 'text-white' : 'text-stone-500'}`} />
                Buku Besar
              </button>
            </div>
          </div>

          {bookingsSubTab === 'ledger' ? (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <LedgerView bookings={bookingsQuery.data || []} />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                {/* Urutkan Booking */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Urutkan:</span>
                  <div className="flex items-center gap-1 bg-stone-200/50 dark:bg-stone-800/40 p-1 rounded-xl border border-border/60">
                    {[
                      { key: 'name', label: 'Nama' },
                      { key: 'total_price', label: 'Total' },
                      { key: 'check_in', label: 'Check-in' },
                      { key: 'status', label: 'Status' }
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleBookingSort(opt.key)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          bookingSortKey === opt.key
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {opt.label}
                        <BookingSortIcon colKey={opt.key} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Status */}
                <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-xl border border-border shrink-0">
                  {['all', 'pending', 'accepted', 'rejected'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setBookingFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        bookingFilter === status
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {status === 'all' ? 'semua' 
                       : status === 'pending' ? 'menunggu' 
                       : status === 'accepted' ? 'disetujui' 
                       : 'ditolak'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm">
                  <EmptyState
                    icon={Inbox}
                    title="Tidak ada booking ditemukan"
                    description={bookingFilter === 'all' ? 'Belum ada penghuni yang memesan kamar.' : `Tidak ada pemesanan dengan status "${bookingFilter}".`}
                    actionLabel="Kembali ke Overview"
                    actionHref="/dashboard"
                  />
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
                  <div className="divide-y divide-border">
                    {paginatedBookings.map((b) => (
                      <div
                        key={b.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-secondary/30 transition-colors duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary font-extrabold text-sm shadow-inner border border-border">
                            {(b.user?.name || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm text-foreground">{b.user?.name || `Penghuni #${b.user_id}`}</p>
                              <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-secondary border border-border">{b.user?.phone || 'No telp -'}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Kamar: <span className="font-medium text-foreground">{b.room?.name || 'Kamar -'}</span> &bull; Check-in: <span className="font-medium text-foreground">{String(b.check_in).slice(0, 10)}</span> &bull; Penghuni: <span className="font-medium text-foreground">{b.occupant_count || 1} Orang</span>
                            </p>
                            {b.renewal_requested && (
                              <div className="mt-1.5">
                                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-bold animate-pulse">
                                  Minta Perpanjangan: {b.renewal_months} Bulan
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-5 pl-14 sm:pl-0">
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Bayar</p>
                            <p className="text-sm font-extrabold text-[#2f3a34]">{formatPrice(b.total_price)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={b.status === 'confirmed' || b.status === 'accepted' ? 'available' : b.status === 'pending' ? 'maintenance' : 'default'}>
                              {b.status === 'confirmed' || b.status === 'accepted' ? 'disetujui' 
                               : b.status === 'pending' ? 'menunggu' 
                               : b.status === 'rejected' ? 'ditolak' 
                               : b.status}
                            </Badge>
                            {b.has_payment_receipt || b.payment_receipt ? (
                              <button
                                type="button"
                                onClick={() => handleViewReceipt(b.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold rounded-xl cursor-pointer shadow-sm text-xs border border-blue-500/20 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Bukti Bayar
                              </button>
                            ) : (
                              b.status === 'pending' && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold italic bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                                  Belum Upload Bukti
                                </span>
                              )
                            )}
                            {b.status === 'pending' && (
                              <div className="flex items-center gap-2 ml-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'accepted')}
                                  className="inline-flex items-center justify-center px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all text-xs border border-emerald-500/20"
                                >
                                  Setujui
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'rejected')}
                                  className="inline-flex items-center justify-center px-3.5 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white font-bold rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all text-xs border border-rose-500/20"
                                >
                                  Tolak
                                </button>
                              </div>
                            )}
                            {b.renewal_requested && (
                              <div className="flex items-center gap-2 ml-1">
                                <button
                                  type="button"
                                  onClick={() => handleRenewalAction(b.id, 'approve')}
                                  className="inline-flex items-center justify-center px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all text-xs border border-emerald-500/20"
                                >
                                  Setujui
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRenewalAction(b.id, 'reject')}
                                  className="inline-flex items-center justify-center px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white font-bold rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all text-xs border border-rose-500/20"
                                >
                                  Tolak
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 border-l border-border pl-3">
                              <button
                                type="button"
                                onClick={() => handleOpenBookingEditModal(b)}
                                className="inline-flex items-center justify-center px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg cursor-pointer shadow-sm active:scale-95 transition-all text-[11px] border border-stone-200/40"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBooking(b)}
                                className="inline-flex items-center justify-center px-2.5 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-bold rounded-lg cursor-pointer shadow-sm active:scale-95 transition-all text-[11px]"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    currentPage={bookingPage}
                    totalItems={filteredBookings.length}
                    itemsPerPage={5}
                    onPageChange={setBookingPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ) : activeTab === 'rooms' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary tracking-tight">Kamar Hunian Kost</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Daftar lengkap kamar, tipe, harga bulanan, dan status occupancy.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 bg-stone-200/50 p-1 rounded-xl border border-border/50">
                {['all', 'available', 'booked'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setRoomFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      roomFilter === status
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {status === 'available' ? 'tersedia' : status === 'booked' ? 'terisi' : 'semua'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-dark transition-all duration-200 cursor-pointer shadow-sm shadow-primary/10 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Tambah Kamar
              </button>
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center text-xs text-muted-foreground">
              Tidak ada kamar dengan status yang dipilih.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedRooms.map((r) => (
                  <div 
                    key={r.id} 
                    className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Room Image */}
                      <div className="aspect-[16/10] overflow-hidden bg-secondary relative">
                        <img 
                          src={r.image || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'} 
                          alt={r.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge variant={r.status}>{r.status}</Badge>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-base text-primary truncate pr-2">{r.name}</h3>
                        </div>
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <p><span className="font-semibold text-foreground">Tipe:</span> <span className="capitalize">{r.type}</span></p>
                          <p><span className="font-semibold text-foreground">Kapasitas:</span> {r.capacity || 0} &bull; <span className="font-semibold text-foreground">Tersedia:</span> {r.stock ?? 0} &bull; <span className="font-semibold text-foreground">Ukuran:</span> {r.size || '3x4 m'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3.5 bg-secondary border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold block">Harga Bulanan</span>
                        <span className="text-sm font-extrabold text-primary">{formatPrice(r.price)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(r)}
                        className="px-3.5 py-2 rounded-xl text-[10px] font-bold bg-[#d9e2d3] text-[#2f3a34] hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit Kamar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                currentPage={roomPage}
                totalItems={filteredRooms.length}
                itemsPerPage={6}
                onPageChange={setRoomPage}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6b8f71] mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              Sistem Aktif
            </p>
            <h2 className="text-2xl font-extrabold text-primary tracking-tight">
              Selamat datang kembali, {user?.name?.split(' ')[0] || 'Admin'}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4.5 mb-8">
            <StatCard label="Total Kamar" value={stats.total} icon={Building2} accent="mocca" />
            <StatCard label="Tersedia (Kosong)" value={stats.available} icon={DoorOpen} accent="sage" />
            <StatCard label="Terisi (Aktif)" value={stats.booked} icon={Building2} accent="coffee" />
            <StatCard label="Pemesanan Pending" value={stats.pendingBookings} icon={CalendarDays} accent="warning" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="px-5 py-4 border-b border-border bg-secondary/50 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-primary flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Pemesanan Kamar Terbaru
                  </h3>
                  <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{bookings.length} total</span>
                </div>
                {bookings.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="Belum ada booking"
                    description="Pemesanan masuk dari calon penghuni akan muncul di sini secara realtime."
                    actionLabel="Lihat Kamar"
                    actionHref="/dashboard?tab=rooms"
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {bookings.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary text-xs font-extrabold shadow-inner">
                            {(b.user?.name || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-semibold text-xs text-foreground">{b.user?.name || `User #${b.user_id}`}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {b.room?.name} &bull; Check-in: {String(b.check_in).slice(0, 10)}
                            </p>
                          </div>
                        </div>
                         <div className="flex items-center gap-4">
                          {(b.has_payment_receipt || b.payment_receipt) && (
                            <button
                              type="button"
                              onClick={() => handleViewReceipt(b.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold rounded-lg cursor-pointer shadow-sm text-[10px] border border-blue-500/20 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Bukti
                            </button>
                          )}
                          <span className="text-xs font-bold text-foreground">{formatPrice(b.total_price)}</span>
                          <Badge variant={b.status === 'confirmed' || b.status === 'accepted' ? 'available' : b.status === 'pending' ? 'maintenance' : 'default'}>
                            {b.status === 'confirmed' || b.status === 'accepted' ? 'disetujui' 
                             : b.status === 'pending' ? 'menunggu' 
                             : b.status === 'rejected' ? 'ditolak' 
                             : b.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4.5 border-t border-border bg-secondary/40 flex justify-center">
                <a 
                  href="/dashboard?tab=bookings" 
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-primary border border-primary/20 bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm hover:shadow transition-all duration-300 cursor-pointer group"
                >
                  <span>Lihat Semua Booking</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Aksi Pengelola</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/dashboard?tab=chats"
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-center gap-2 cursor-pointer group"
                  >
                    <MessageSquare className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-bold">Buka Chat</span>
                  </a>
                  <a
                    href="/dashboard?tab=settings"
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-center gap-2 cursor-pointer group"
                  >
                    <Settings className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-bold">Pengaturan</span>
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#27312b] to-[#1f2722] rounded-2xl p-5 text-[#d9e2d3] shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10">
                  <Building2 className="h-32 w-32" />
                </div>
                
                <h3 className="font-bold text-xs uppercase tracking-wider text-sage mb-3">Informasi Kost</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-sage shrink-0" />
                    <span className="font-medium truncate">{kostPhone}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-sage shrink-0 mt-0.5" />
                    <span className="leading-relaxed opacity-95">{kostAddress}</span>
                  </div>
                  <div className="flex items-center gap-2.5 border-t border-white/5 pt-3 mt-3">
                    <Shield className="h-4 w-4 text-sage shrink-0" />
                    <span>Nama Kost: <strong className="text-white font-semibold">{kostName}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1f2722]/60 backdrop-blur-sm transition-opacity">
          <div className="bg-card rounded-3xl border border-border max-w-md w-full shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
            <div className="px-6 py-4.5 border-b border-border bg-secondary/50 flex items-center justify-between">
              <h3 className="font-bold text-base text-primary">
                {modalMode === 'add' ? 'Tambah Kamar Baru' : 'Edit Info Kamar'}
              </h3>
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-semibold p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmitRoom} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">Nama Kamar</label>
                  <input
                    type="text"
                    value={formRoomName}
                    onChange={(e) => setFormRoomName(e.target.value)}
                    placeholder="Contoh: Kamar A3"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Tipe Kamar</label>
                  <select
                    value={formRoomType}
                    onChange={(e) => setFormRoomType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                  >
                    <option value="kosongan">Kosongan</option>
                    <option value="fasilitas">Fasilitas (Isian)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Harga Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={formRoomPrice}
                    onChange={(e) => setFormRoomPrice(Number(e.target.value))}
                    required
                    min="0"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Kapasitas (Total)</label>
                  <input
                    type="number"
                    value={formRoomCapacity}
                    onChange={(e) => setFormRoomCapacity(Number(e.target.value))}
                    required
                    min="1"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Stok (Tersedia)</label>
                  <input
                    type="number"
                    value={formRoomStock}
                    onChange={(e) => setFormRoomStock(Number(e.target.value))}
                    required
                    min="0"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Ukuran Kamar</label>
                  <input
                    type="text"
                    value={formRoomSize}
                    onChange={(e) => setFormRoomSize(e.target.value)}
                    placeholder="Contoh: 3x4 m"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">Status Kamar</label>
                  <select
                    value={formRoomStatus}
                    onChange={(e) => setFormRoomStatus(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                  >
                    <option value="available">Tersedia (Kosong)</option>
                    <option value="booked">Booked (Dipesan)</option>
                    <option value="occupied">Occupied (Terisi)</option>
                    <option value="maintenance">Maintenance (Perbaikan)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">Gambar Kamar</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border/80 bg-secondary hover:bg-stone-100 hover:border-primary/40 cursor-pointer transition-all text-xs font-semibold text-muted-foreground hover:text-foreground">
                        <Upload className="h-4 w-4" />
                        {isUploading ? 'Mengunggah...' : 'Pilih & Upload File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                      
                      {formRoomImage && (
                        <div className="h-10 w-10 rounded-xl overflow-hidden border border-border bg-stone-100 shrink-0">
                          <img src={formRoomImage} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="h-px bg-border flex-1"></span>
                      <span>atau masukkan URL gambar</span>
                      <span className="h-px bg-border flex-1"></span>
                    </div>

                    <input
                      type="text"
                      value={formRoomImage}
                      onChange={(e) => setFormRoomImage(e.target.value)}
                      placeholder="Contoh: https://images.unsplash.com/..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">Deskripsi</label>
                  <textarea
                    value={formRoomDescription}
                    onChange={(e) => setFormRoomDescription(e.target.value)}
                    placeholder="Deskripsi fasilitas kamar..."
                    rows="3"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                {modalMode === 'edit' ? (
                  <button
                    type="button"
                    onClick={handleDeleteRoom}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-all duration-200 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus Kamar
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-card border border-border text-foreground hover:bg-secondary transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-primary text-primary-foreground hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Simpan
                  </button>
                </div>
              </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Edit User */}
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1f2722]/60 backdrop-blur-sm transition-opacity">
            <div className="bg-card rounded-3xl border border-border max-w-md w-full shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-in">
              <div className="px-6 py-4.5 border-b border-border bg-secondary/50 flex items-center justify-between">
                <h3 className="font-bold text-base text-primary">Edit Profil Pengguna</h3>
                <button 
                  type="button" 
                  onClick={handleCloseUserModal}
                  className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-semibold p-1 hover:bg-secondary rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>

              <form onSubmit={handleSubmitUser} className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={formUserName}
                      onChange={(e) => setFormUserName(e.target.value)}
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={formUserEmail}
                      onChange={(e) => setFormUserEmail(e.target.value)}
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">WhatsApp / Telepon</label>
                    <input
                      type="text"
                      value={formUserPhone}
                      onChange={(e) => setFormUserPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Alamat KTP / Asal</label>
                    <input
                      type="text"
                      value={formUserAddress}
                      onChange={(e) => setFormUserAddress(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Password Baru (Opsional)</label>
                    <input
                      type="password"
                      value={formUserPassword}
                      onChange={(e) => setFormUserPassword(e.target.value)}
                      placeholder="Kosongkan jika tidak ingin diubah"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseUserModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-card border border-border text-foreground hover:bg-secondary transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-primary text-primary-foreground hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Edit Booking */}
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1f2722]/60 backdrop-blur-sm transition-opacity">
            <div className="bg-card rounded-3xl border border-border max-w-md w-full shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-in">
              <div className="px-6 py-4.5 border-b border-border bg-secondary/50 flex items-center justify-between">
                <h3 className="font-bold text-base text-primary">Edit Detail Pemesanan</h3>
                <button 
                  type="button" 
                  onClick={handleCloseBookingModal}
                  className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-semibold p-1 hover:bg-secondary rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>

              <form onSubmit={handleSaveBookingEdit} className="p-6 space-y-4">
                <div className="space-y-4">
                  {/* Pemesan */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Nama Pemesan</label>
                    <input
                      type="text"
                      value={selectedBooking?.user?.name || ''}
                      disabled
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-stone-100/80 text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  {/* Kamar Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Pilih Kamar</label>
                    <select
                      value={formBookingRoomId}
                      onChange={(e) => setFormBookingRoomId(e.target.value)}
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                    >
                      {selectedBooking?.room && (
                        <option value={selectedBooking.room.id}>
                          {selectedBooking.room.name} (Kamar Sekarang)
                        </option>
                      )}
                      {rooms
                        .filter(r => r.status === 'available' && r.id !== selectedBooking?.room_id)
                        .map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} - {r.type} (Tersedia)
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  {/* Check-In Date */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Tanggal Check-In</label>
                    <DatePicker
                      value={formBookingCheckIn}
                      onChange={(e) => setFormBookingCheckIn(e.target.value)}
                      placeholder="Pilih tanggal check-in"
                      required
                    />
                  </div>

                  {/* Durasi Sewa */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Durasi Sewa (Bulan)</label>
                    <input
                      type="number"
                      min="1"
                      value={formBookingDuration}
                      onChange={(e) => setFormBookingDuration(e.target.value)}
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                    />
                  </div>

                  {/* Jumlah Penghuni */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Jumlah Penghuni</label>
                    <select
                      value={formBookingOccupants}
                      onChange={(e) => setFormBookingOccupants(Number(e.target.value))}
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50"
                    >
                      <option value={1}>1 Orang</option>
                      <option value={2}>2 Orang (+Rp 100.000/bln)</option>
                    </select>
                  </div>

                  {/* Catatan */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Catatan Tambahan</label>
                    <textarea
                      value={formBookingNotes}
                      onChange={(e) => setFormBookingNotes(e.target.value)}
                      placeholder="Catatan tambahan..."
                      rows="3"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-secondary/50 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseBookingModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-card border border-border text-foreground hover:bg-secondary transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-primary text-primary-foreground hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewingReceipt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setViewingReceipt(null)}
          >
            <div
              className="bg-[#f8f7f2] dark:bg-[#1f2722] rounded-2xl max-w-2xl w-full p-6 border border-border/40 dark:border-[#323e37] shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-foreground">
                  Bukti Transfer Pembayaran
                </h3>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 cursor-pointer text-foreground border border-border/10"
                >
                  Tutup
                </button>
              </div>
              <div className="flex justify-center bg-secondary dark:bg-stone-900 rounded-xl p-2 border border-border/20 overflow-hidden max-h-[60vh] min-h-[200px] items-center w-full">
                {viewingReceipt === 'loading' ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 w-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground font-semibold">Memuat bukti transfer...</p>
                  </div>
                ) : viewingReceipt === 'no_receipt' ? (
                  <div className="p-10 text-center text-xs text-muted-foreground font-semibold">
                    Bukti transfer tidak ditemukan.
                  </div>
                ) : (
                  <img
                    src={viewingReceipt}
                    alt="Bukti Transfer"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    )
  }


