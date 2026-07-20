import { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export function DatePicker({ value, onChange, minDate, placeholder = 'Pilih tanggal', required = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const containerRef = useRef(null)

  // Initialize calendar view to the selected value or today
  useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value))
    } else {
      setCurrentDate(new Date())
    }
  }, [value, isOpen])

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Helper to format date object to YYYY-MM-DD string
  const formatToYmd = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // Get human readable Indonesian format (e.g. 21 Juli 2026)
  const getReadableFormat = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  }

  // Generate calendar days
  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sun, 1 = Mon ...
    // Map Sunday (0) to index 6, Monday (1) to index 0...
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1
    
    const totalDays = new Date(year, month + 1, 0).getDate()
    const days = []

    // Empty spots for preceding month
    for (let i = 0; i < startOffset; i++) {
      days.push(null)
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const daysList = getDaysInMonth()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleSelectDay = (date) => {
    if (!date) return
    const formatted = formatToYmd(date)
    
    // Check if less than minDate
    if (minDate && formatted < minDate) return
    
    onChange({ target: { name: 'check_in', value: formatted } }) // Mock event for compatibility
    setIsOpen(false)
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date) => {
    if (!date || !value) return false
    const sel = new Date(value)
    return date.getDate() === sel.getDate() &&
      date.getMonth() === sel.getMonth() &&
      date.getFullYear() === sel.getFullYear()
  }

  const isPastDate = (date) => {
    if (!date) return false
    const formatted = formatToYmd(date)
    return minDate && formatted < minDate
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Input */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between input-field outline-none cursor-pointer pr-3 transition-all select-none"
        style={{
          background: 'var(--secondary)',
          color: value ? 'var(--foreground)' : 'var(--muted-foreground)',
          borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
          borderRadius: '1rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          paddingLeft: '1rem',
          fontSize: '0.875rem',
          borderWidth: '1.5px',
          borderStyle: 'solid'
        }}
      >
        <span className="truncate">{getReadableFormat(value) || placeholder}</span>
        <CalendarIcon className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
      </div>

      {/* Popover Calendar Container */}
      {isOpen && (
        <div 
          className="absolute z-50 left-0 top-[calc(100%+8px)] w-76 bg-card border border-border rounded-2xl shadow-xl p-4 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-primary">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {DAYS.map((d, i) => (
              <div key={i} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysList.map((date, idx) => {
              if (date === null) {
                return <div key={`empty-${idx}`} />
              }

              const selected = isSelected(date)
              const disabled = isPastDate(date)
              const today = isToday(date)

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(date)}
                  className={`h-8 w-8 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center relative select-none disabled:opacity-25 disabled:cursor-not-allowed ${
                    selected
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                      : today
                      ? 'bg-secondary text-primary border border-primary/30'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  {date.getDate()}
                  {today && !selected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
            <button
              type="button"
              onClick={() => handleSelectDay(new Date())}
              className="text-[10px] font-extrabold text-primary hover:underline cursor-pointer"
            >
              Hari Ini
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange({ target: { name: 'check_in', value: '' } })
                  setIsOpen(false)
                }}
                className="text-[10px] font-bold text-destructive hover:underline cursor-pointer flex items-center gap-0.5"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
