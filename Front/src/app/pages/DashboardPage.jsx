import { useEffect, useMemo, useState } from 'react'
import { Building2, CalendarDays, DoorOpen, Inbox, Save, Sparkles, Phone, MapPin, Eye, Bell, Settings, Shield, MessageSquare, ArrowRight, Pencil, Plus, Trash2, Upload, Users } from 'lucide-react'
import { AdminLayout } from '../layouts/AdminLayout'
import { StatCard } from '../components/StatCard'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
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
import { AdminChatPanel } from '../components/AdminChatPanel'
import { toast } from 'sonner'
import { uploadRoomImage } from '../../api/rooms'

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
          className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
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
                  : 'border border-border hover:bg-stone-50 text-foreground'
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
          className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
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
  const { refreshSubscriptions } = useSocket()
  const [viewingReceipt, setViewingReceipt] = useState(null)

  // State for filtering
  const [roomFilter, setRoomFilter] = useState('all')
  const [bookingFilter, setBookingFilter] = useState('all')

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
    () => ({
      total: rooms.length,
      available: rooms.filter((r) => r.status === 'available').length,
      booked: rooms.filter((r) => r.status === 'booked' || r.status === 'occupied').length,
      pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    }),
    [rooms, bookings],
  )

  // Modal handlers
  const handleOpenAddModal = () => {
    setModalMode('add')
    setSelectedRoom(null)
    setFormRoomName('')
    setFormRoomType('kosongan')
    setFormRoomPrice(800000)
    setFormRoomFloor(1)
    setFormRoomSize('3x4 m')
    setFormRoomStatus('available')
    setFormRoomDescription('')
    setFormRoomImage('')
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

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return bookings
    return bookings.filter(b => b.status === bookingFilter)
  }, [bookings, bookingFilter])

  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice((bookingPage - 1) * 5, bookingPage * 5)
  }, [filteredBookings, bookingPage])

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

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((clientPage - 1) * 8, clientPage * 8)
  }, [filteredUsers, clientPage])

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
                className="text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-white w-56 shadow-sm"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center text-xs text-muted-foreground">
              Tidak ada penyewa ditemukan.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-border text-xs font-bold text-[#412D15] uppercase tracking-wider">
                      <th className="p-4 pl-6">Nama / Email</th>
                      <th className="p-4">WhatsApp / Telp</th>
                      <th className="p-4">Alamat KTP / Asal</th>
                      <th className="p-4 pr-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {paginatedUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-surface-warm/20 transition-colors">
                        <td className="p-4 pl-6">
                          <div>
                            <span className="font-bold text-foreground block">{usr.name}</span>
                            <span className="text-muted-foreground block text-[10px] mt-0.5">{usr.email}</span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-foreground">{usr.phone || '-'}</td>
                        <td className="p-4 max-w-[200px] truncate" title={usr.address}>{usr.address || '-'}</td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenUserEditModal(usr)}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-[#EDE8DC] hover:bg-primary hover:text-white text-primary font-bold rounded-lg cursor-pointer shadow-sm active:scale-95 transition-all"
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
        <div className="max-w-3xl bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-stone-50/50 flex items-center justify-between">
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
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Nomor WA Pengelola</label>
                  <input
                    type="text"
                    value={kostPhone}
                    onChange={(e) => setKostPhone(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Alamat Kost</label>
                  <input
                    type="text"
                    value={kostAddress}
                    onChange={(e) => setKostAddress(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
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
            
            <div className="flex items-center gap-1.5 bg-stone-200/50 p-1 rounded-xl border border-border/50 shrink-0 self-start sm:self-auto">
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
            <div className="bg-white rounded-2xl border border-border shadow-sm">
              <EmptyState
                icon={Inbox}
                title="Tidak ada booking ditemukan"
                description={bookingFilter === 'all' ? 'Belum ada penghuni yang memesan kamar.' : `Tidak ada pemesanan dengan status "${bookingFilter}".`}
                actionLabel="Kembali ke Overview"
                actionHref="/dashboard"
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
              <div className="divide-y divide-border">
                {paginatedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-surface-warm/30 transition-colors duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#412D15]/10 to-[#B0BA99]/35 text-[#412D15] font-extrabold text-sm shadow-inner">
                        {(b.user?.name || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground">{b.user?.name || `Penghuni #${b.user_id}`}</p>
                          <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200">{b.user?.phone || 'No telp -'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Kamar: <span className="font-medium text-foreground">{b.room?.name || 'Kamar -'}</span> &bull; Check-in: <span className="font-medium text-foreground">{String(b.check_in).slice(0, 10)}</span>
                        </p>
                        {b.renewal_requested && (
                          <div className="mt-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200/50 px-2.5 py-1 rounded-lg font-bold animate-pulse">
                              Minta Perpanjangan: {b.renewal_months} Bulan
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-5 pl-14 sm:pl-0">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Bayar</p>
                        <p className="text-sm font-extrabold text-[#412D15]">{formatPrice(b.total_price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={b.status === 'confirmed' || b.status === 'accepted' ? 'available' : b.status === 'pending' ? 'maintenance' : 'default'}>
                          {b.status === 'confirmed' || b.status === 'accepted' ? 'disetujui' 
                           : b.status === 'pending' ? 'menunggu' 
                           : b.status === 'rejected' ? 'ditolak' 
                           : b.status}
                        </Badge>
                        {b.payment_receipt ? (
                          <button
                            type="button"
                            onClick={() => setViewingReceipt(b.payment_receipt)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold rounded-xl cursor-pointer shadow-sm text-xs border border-blue-200/40 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Bukti Bayar
                          </button>
                        ) : (
                          b.status === 'pending' && (
                            <span className="text-[10px] text-amber-700 font-semibold italic bg-amber-50 border border-amber-200/30 px-2.5 py-1 rounded-lg">
                              Belum Upload Bukti
                            </span>
                          )
                        )}
                        {b.status === 'pending' && (
                          <div className="flex items-center gap-2 ml-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b.id, 'accepted')}
                              className="inline-flex items-center justify-center px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all text-xs border border-emerald-200/40"
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b.id, 'rejected')}
                              className="inline-flex items-center justify-center px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all text-xs border border-rose-200/40"
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
                              className="inline-flex items-center justify-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all text-xs border border-emerald-200/40"
                            >
                              Setujui Perpanjang
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRenewalAction(b.id, 'reject')}
                              className="inline-flex items-center justify-center px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all text-xs border border-rose-200/40"
                            >
                              Tolak Perpanjang
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 ml-2 border-l border-border/60 pl-3">
                          <button
                            type="button"
                            onClick={() => handleOpenBookingEditModal(b)}
                            className="inline-flex items-center justify-center px-2.5 py-1.5 bg-[#EDE8DC] hover:bg-primary hover:text-white text-primary font-bold rounded-lg cursor-pointer shadow-sm active:scale-95 transition-all text-[11px]"
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
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center text-xs text-muted-foreground">
              Tidak ada kamar dengan status yang dipilih.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedRooms.map((r) => (
                  <div 
                    key={r.id} 
                    className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Room Image */}
                      <div className="aspect-[16/10] overflow-hidden bg-[#EDE8DC] relative">
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
                          <p><span className="font-semibold text-foreground">Lantai:</span> {r.floor || 1} &bull; <span className="font-semibold text-foreground">Ukuran:</span> {r.size || '3x4 m'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3.5 bg-stone-50 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold block">Harga Bulanan</span>
                        <span className="text-sm font-extrabold text-primary">{formatPrice(r.price)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(r)}
                        className="px-3.5 py-2 rounded-xl text-[10px] font-bold bg-[#EDE8DC] text-[#412D15] hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
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
            <p className="text-xs font-bold uppercase tracking-wider text-[#B0BA99] mb-1 flex items-center gap-1.5">
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
            <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="px-5 py-4 border-b border-border bg-stone-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#412D15] flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#B0BA99]" />
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
                        className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-warm/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-primary text-xs font-extrabold shadow-inner">
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
                          {b.payment_receipt && (
                            <button
                              type="button"
                              onClick={() => setViewingReceipt(b.payment_receipt)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold rounded-lg cursor-pointer shadow-sm text-[10px] border border-blue-200/40 transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                              Bukti
                            </button>
                          )}
                          <span className="text-xs font-bold text-[#412D15]">{formatPrice(b.total_price)}</span>
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
              <div className="p-4.5 border-t border-border bg-stone-50/40 flex justify-center">
                <a 
                  href="/dashboard?tab=bookings" 
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-primary border border-primary/20 bg-white hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm hover:shadow transition-all duration-300 cursor-pointer group"
                >
                  <span>Lihat Semua Booking</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Aksi Pengelola</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/dashboard?tab=chats"
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-surface-sage/35 text-[#4a7c59] hover:bg-surface-sage/60 transition-colors text-center gap-2 cursor-pointer group"
                  >
                    <MessageSquare className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-bold">Buka Chat</span>
                  </a>
                  <a
                    href="/dashboard?tab=settings"
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-surface-mocca/40 text-primary hover:bg-surface-mocca/70 transition-colors text-center gap-2 cursor-pointer group"
                  >
                    <Settings className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-bold">Pengaturan</span>
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#2e1e0a] to-[#1F150C] rounded-2xl p-5 text-[#EDE8DC] shadow-sm relative overflow-hidden">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F150C]/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl border border-border max-w-md w-full shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
            <div className="px-6 py-4.5 border-b border-border bg-stone-50/50 flex items-center justify-between">
              <h3 className="font-bold text-base text-primary">
                {modalMode === 'add' ? 'Tambah Kamar Baru' : 'Edit Info Kamar'}
              </h3>
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-semibold p-1 hover:bg-stone-100 rounded-lg transition-colors"
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
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Tipe Kamar</label>
                  <select
                    value={formRoomType}
                    onChange={(e) => setFormRoomType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
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
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Lantai</label>
                  <input
                    type="number"
                    value={formRoomFloor}
                    onChange={(e) => setFormRoomFloor(Number(e.target.value))}
                    required
                    min="1"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
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
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">Status Kamar</label>
                  <select
                    value={formRoomStatus}
                    onChange={(e) => setFormRoomStatus(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
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
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border/80 bg-stone-50 hover:bg-stone-100 hover:border-primary/40 cursor-pointer transition-all text-xs font-semibold text-muted-foreground hover:text-foreground">
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
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
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
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50 resize-none"
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
                    className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-white border border-border text-foreground hover:bg-stone-50 transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F150C]/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl border border-border max-w-md w-full shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-in">
              <div className="px-6 py-4.5 border-b border-border bg-stone-50/50 flex items-center justify-between">
                <h3 className="font-bold text-base text-primary">Edit Profil Pengguna</h3>
                <button 
                  type="button" 
                  onClick={handleCloseUserModal}
                  className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-semibold p-1 hover:bg-stone-100 rounded-lg transition-colors"
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
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={formUserEmail}
                      onChange={(e) => setFormUserEmail(e.target.value)}
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">WhatsApp / Telepon</label>
                    <input
                      type="text"
                      value={formUserPhone}
                      onChange={(e) => setFormUserPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Alamat KTP / Asal</label>
                    <input
                      type="text"
                      value={formUserAddress}
                      onChange={(e) => setFormUserAddress(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Password Baru (Opsional)</label>
                    <input
                      type="password"
                      value={formUserPassword}
                      onChange={(e) => setFormUserPassword(e.target.value)}
                      placeholder="Kosongkan jika tidak ingin diubah"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseUserModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-white border border-border text-foreground hover:bg-stone-50 transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F150C]/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl border border-border max-w-md w-full shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-in">
              <div className="px-6 py-4.5 border-b border-border bg-stone-50/50 flex items-center justify-between">
                <h3 className="font-bold text-base text-primary">Edit Detail Pemesanan</h3>
                <button 
                  type="button" 
                  onClick={handleCloseBookingModal}
                  className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-semibold p-1 hover:bg-stone-100 rounded-lg transition-colors"
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
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
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
                    <input
                      type="date"
                      value={formBookingCheckIn}
                      onChange={(e) => setFormBookingCheckIn(e.target.value)}
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
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
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50"
                    />
                  </div>

                  {/* Catatan */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Catatan Tambahan</label>
                    <textarea
                      value={formBookingNotes}
                      onChange={(e) => setFormBookingNotes(e.target.value)}
                      placeholder="Catatan tambahan..."
                      rows="3"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-stone-50/50 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseBookingModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer bg-white border border-border text-foreground hover:bg-stone-50 transition-colors"
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
              className="bg-[#FDFCF9] dark:bg-[#1d1409] rounded-2xl max-w-2xl w-full p-6 border border-border/40 dark:border-[#3a2a18] shadow-2xl relative"
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
              <div className="flex justify-center bg-stone-50 dark:bg-stone-900 rounded-xl p-2 border border-border/20 overflow-hidden max-h-[60vh]">
                <img
                  src={viewingReceipt}
                  alt="Bukti Transfer"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    )
  }
