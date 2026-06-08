export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-slate-100" />
    </div>
  )
}
