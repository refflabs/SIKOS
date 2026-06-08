import { useState } from "react";
import { Button } from "../components/Button";
import { login } from "../../api/auth";

export function LoginPage() {
  const [email, setEmail] = useState("admin@kost.com");
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
      <h1 className="text-xl font-bold tracking-tight text-center mb-1">Masuk ke admin</h1>
      <p className="text-subtitle text-sm text-center mb-8">
        Kelola kamar dan booking penghuni Kost Pak RT.
      </p>

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
            placeholder="admin@kost.com"
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

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Demo: <span className="font-mono text-foreground/70">admin@kost.com</span> / password
      </p>
    </>
  );
}
