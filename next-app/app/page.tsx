import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Page() {
  const { userId } = await auth()

  // Kalau sudah login, langsung ke home
  if (userId) {
    redirect("/home")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#141414] px-6 text-center">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-black">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-widest text-white">DEADLINEKU</span>
      </div>

      <h1 className="mb-4 text-5xl font-black uppercase tracking-tight text-white md:text-6xl">
        Track Your
        <br />
        Artwork Progress
      </h1>
      <p className="mb-10 max-w-md text-zinc-400">
        Manage your creative workflow — from Sketch to Done. Never miss a deadline again.
      </p>

      <div className="flex gap-4">
        <Link
          href="/register"
          className="rounded-lg bg-white px-8 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-700 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Log In
        </Link>
      </div>
    </div>
  )
}
