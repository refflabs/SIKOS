import { Building2 } from "lucide-react";

/** Centered minimal login — Linear / Vercel style */
export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--slate-50)] flex flex-col items-center justify-center px-4 py-12">
      <a href="/" className="flex items-center gap-2.5 mb-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Building2 className="h-5 w-5" />
        </span>
        <span className="text-sm font-bold">Kost Pak RT</span>
      </a>

      <div className="w-full max-w-[400px] bg-white rounded-2xl border border-border shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.06)] p-8 sm:p-10">
        {children}
      </div>

      <a
        href="/"
        className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Kembali ke beranda
      </a>
    </div>
  );
}
