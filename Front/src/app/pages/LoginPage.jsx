import { useState } from "react";
import { Button } from "../components/Button";
import { useAuth } from "../../context/AuthContext";

const ROLES = [
  {
    id: "tenant",
    label: "Penghuni Kost",
    desc: "Akses booking, profil, dan bantuan.",
  },
  {
    id: "admin",
    label: "Admin",
    desc: "Kelola kamar dan booking penghuni.",
  },
];

export function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState("tenant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user?.role === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.email?.[0] ||
          "Email atau password salah.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-xl font-bold tracking-tight text-center mb-1">Masuk</h1>
      <p className="text-subtitle text-sm text-center mb-6">
        Pilih jenis akun dan masuk ke Kost Pak RT.
      </p>

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => {
              setSelectedRole(role.id);
              setEmail("");
              setPassword("");
              setError("");
            }}
            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
              selectedRole === role.id
                ? "border-teal-600 bg-teal-50/60 shadow-sm"
                : "border-border bg-white hover:border-stone-300 hover:bg-stone-50/50"
            }`}
          >
            <span
              className={`block text-sm font-semibold mb-0.5 ${
                selectedRole === role.id ? "text-teal-800" : "text-foreground"
              }`}
            >
              {role.label}
            </span>
            <span className="block text-xs text-muted-foreground leading-snug">
              {role.desc}
            </span>
            {selectedRole === role.id && (
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-teal-600" />
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="text-label block mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder={selectedRole === "admin" ? "admin@kost.com" : "email@contoh.com"}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-label block mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
          {loading ? "Memproses…" : "Masuk"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <a href="/register" className="font-semibold text-foreground hover:underline">
          Daftar
        </a>
      </p>
    </>
  );
}
