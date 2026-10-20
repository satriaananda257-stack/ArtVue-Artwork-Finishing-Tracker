"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useSignUp, useSignIn, useAuth } from "@clerk/nextjs"

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useSignUp()
  const { signIn } = useSignIn()
  const { getToken, isSignedIn } = useAuth()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Kalau sudah sign-in via Clerk (Google), exchange ke backend JWT
  useEffect(() => {
    if (!isSignedIn) return
    const exchangeToken = async () => {
      try {
        const clerkToken = await getToken()
        if (!clerkToken) return
        const res = await fetch("http://localhost:5000/api/v1/auth/clerk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkToken }),
        })
        const data = await res.json()
        if (res.ok) {
          localStorage.setItem("token", data.data.token)
          localStorage.setItem("user", JSON.stringify(data.data.user))
          router.push("/home")
        }
      } catch {
        // silent
      }
    }
    exchangeToken()
  }, [isSignedIn, getToken, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !email || !password) {
      setError("Semua field wajib diisi.")
      return
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? "Gagal membuat akun.")
        return
      }
      // Auto login setelah register
      const loginRes = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const loginData = await loginRes.json()
      if (loginRes.ok) {
        localStorage.setItem("token", loginData.data.token)
        localStorage.setItem("user", JSON.stringify(loginData.data.user))
      }
      router.push("/home")
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!signIn) return
    setGoogleLoading(true)
    setError(null)
    try {
      await signIn.create({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        actionCompleteRedirectUrl: `${window.location.origin}/home`,
      } as Parameters<typeof signIn.create>[0])
    } catch {
      setError("Gagal daftar dengan Google. Aktifkan Google di Clerk Dashboard terlebih dahulu.")
      setGoogleLoading(false)
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

        <h1 className="mb-1 text-2xl font-bold text-white">Buat Akun</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-white underline">
            Masuk
          </Link>
        </p>

        {/* Google Sign Up */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading || !signIn}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {googleLoading ? "Menghubungkan..." : "Daftar dengan Google"}
        </button>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-600">atau daftar manual</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username kamu"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

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
                placeholder="min. 6 karakter"
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
            {loading ? "Mendaftar..." : "Daftar Sekarang"}
          </button>
        </form>
      </div>

      {/* Right — artwork image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-4xl font-black uppercase leading-tight tracking-wider text-white">
            START YOUR
            <br />
            CREATIVE JOURNEY
          </p>
        </div>
      </div>
    </div>
  )
}
