const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'

export const roomImage = (room) => room?.image || FALLBACK_IMAGE

export const roomFacilities = (room) => {
  if (!room?.facilities) return []
  if (Array.isArray(room.facilities)) return room.facilities
  try {
    return JSON.parse(room.facilities)
  } catch {
    return []
  }
}

export const isRoomAvailable = (room) =>
  room?.status === 'available'

export const statusLabel = (status) => {
  if (status === 'available') return 'Tersedia'
  if (status === 'booked') return 'Terisi'
  if (status === 'maintenance') return 'Perawatan'
  return status
}

export const formatPrice = (price) =>
  `Rp ${Number(price).toLocaleString('id-ID')}`
