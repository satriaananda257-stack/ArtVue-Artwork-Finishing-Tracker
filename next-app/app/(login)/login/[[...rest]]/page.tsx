"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Email dan password wajib diisi.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? "Email atau password salah.")
        return
      }
      localStorage.setItem("token", data.data.token)
      localStorage.setItem("user", JSON.stringify(data.data.user))
      // Set cookie for middleware auth check
      document.cookie = `token=${data.data.token}; path=/; max-age=604800; SameSite=Lax`
      router.push("/home")
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#141414]">
      {/* Left — form */}
      <div className="flex w-full flex-col justify-center px-8 md:w-1/2 md:px-16 lg:px-24">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">ArtVue</span>
        </div>

        <h1 className="mb-1 text-2xl font-bold text-white">Masuk</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Belum punya akun?{" "}
          <Link href="/register" className="text-white underline">
            Daftar
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 pr-11 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
      </div>

      {/* Right — artwork image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-4xl font-black uppercase leading-tight tracking-wider text-white">
            WHERE ART MEETS
            <br />
            DEADLINE
          </p>
        </div>
      </div>
    </div>
  )
}
