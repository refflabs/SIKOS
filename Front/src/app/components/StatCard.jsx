export function StatCard({ label, value, icon: Icon, accent = 'mocca' }) {
  const accents = {
    mocca: 'bg-gradient-to-br from-[#f5efe6] to-[#FDFCF9] border-[#D8D0BE]/80 text-[#412D15]',
    sage: 'bg-gradient-to-br from-[#f0f2ec] to-[#FDFCF9] border-[#B0BA99]/40 text-[#4a7c59]',
    coffee: 'bg-gradient-to-br from-card to-[#F7F4EE]/30 border-[#D8D0BE]/60 text-[#1F150C]',
    warning: 'bg-gradient-to-br from-[#fbf4eb] to-[#FDFCF9] border-[#c07d3a]/30 text-[#c07d3a]',
  }
  const iconBg = {
    mocca: 'bg-[#412D15]/8 text-primary',
    sage: 'bg-[#B0BA99]/25 text-[#4a7c59]',
    coffee: 'bg-[#1F150C]/8 text-[#1F150C]',
    warning: 'bg-[#c07d3a]/10 text-[#c07d3a]',
  }

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${accents[accent] || accents.mocca}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label !text-[10px] mb-1.5 opacity-80 truncate">{label}</p>
          <p className="text-3xl font-extrabold tracking-tight text-foreground leading-none">{value}</p>
        </div>
        {Icon && (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform duration-300 group-hover:scale-105 ${iconBg[accent]}`}
          >
            <Icon className="h-5.5 w-5.5" />
          </span>
        )}
      </div>
    </div>
  )
}

