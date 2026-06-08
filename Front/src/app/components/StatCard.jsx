export function StatCard({ label, value, icon: Icon, accent = 'teal' }) {
  const accents = {
    teal: 'bg-surface-teal border-teal-200/60 text-teal-800',
    amber: 'bg-surface-amber border-amber-200/60 text-amber-900',
    indigo: 'bg-surface-indigo border-indigo-200/60 text-indigo-900',
  }
  const iconBg = {
    teal: 'bg-teal-100 text-teal-700',
    amber: 'bg-amber-100 text-amber-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  }

  return (
    <div
      className={`rounded-xl border p-5 ${accents[accent] || accents.teal}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label !text-[10px] mb-2">{label}</p>
          <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
        </div>
        {Icon && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg[accent]}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  )
}
