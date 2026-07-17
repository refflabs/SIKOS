const variants = {
  available: "bg-emerald-50 text-emerald-800 border-emerald-200",
  booked: "bg-slate-100 text-slate-600 border-slate-200",
  occupied: "bg-slate-100 text-slate-600 border-slate-200",
  maintenance: "bg-amber-50 text-amber-800 border-amber-200",
  default: "bg-slate-100 text-slate-600 border-slate-200",
};

export function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
