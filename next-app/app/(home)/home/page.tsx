"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  ImageOff,
  Loader2,
  LogOut,
  ChevronDown,
  CalendarDays,
  CheckCircle2,
  Clock,
} from "lucide-react"

const WORK_STATUS = [
  "Sketch",
  "Line Art",
  "Coloring",
  "Shading",
  "Background",
  "Final Touch",
  "Done",
] as const

type WorkStatus = (typeof WORK_STATUS)[number]

interface Work {
  id: number
  title: string
  imageUrl: string | null
  status: WorkStatus
  createdAt: string
  completedAt: string | null
  description: string | null
}

const STATUS_COLOR: Record<WorkStatus, string> = {
  Sketch: "bg-zinc-700 text-zinc-300",
  "Line Art": "bg-blue-900/60 text-blue-300",
  Coloring: "bg-purple-900/60 text-purple-300",
  Shading: "bg-orange-900/60 text-orange-300",
  Background: "bg-teal-900/60 text-teal-300",
  "Final Touch": "bg-yellow-900/60 text-yellow-300",
  Done: "bg-green-900/60 text-green-300",
}

const STATUS_DOT: Record<WorkStatus, string> = {
  Sketch: "bg-zinc-400",
  "Line Art": "bg-blue-400",
  Coloring: "bg-purple-400",
  Shading: "bg-orange-400",
  Background: "bg-teal-400",
  "Final Touch": "bg-yellow-400",
  Done: "bg-green-400",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface LocalUser {
  id: number
  username: string | null
  email: string
  role: string
}

export default function HomePage() {
  const router = useRouter()

  const [localUser, setLocalUser] = useState<LocalUser | null>(null)

  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<WorkStatus | "All">("All")
  const [sortNewest, setSortNewest] = useState(true)
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const token =
    typeof window !== "undefined" ? (localStorage.getItem("token") ?? "") : ""

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user")
      if (raw) setLocalUser(JSON.parse(raw))
      else router.push("/login")
    }
  }, [])

  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true)
      try {
        const res = await fetch("http://localhost:5000/api/v1/works", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) setWorks(data.data.works)
        else setError(data.message ?? "Gagal memuat karya.")
      } catch {
        setError("Gagal memuat data.")
      } finally {
        setLoading(false)
      }
    }
    fetchWorks()
  }, [token])

  const filtered = works
    .filter((w) => {
      const matchSearch = w.title.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === "All" || w.status === filterStatus
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const da = new Date(a.createdAt).getTime()
      const db = new Date(b.createdAt).getTime()
      return sortNewest ? db - da : da - db
    })

  const doneCount = works.filter((w) => w.status === "Done").length
  const inProgressCount = works.filter((w) => w.status !== "Done").length

  const handleSignOut = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white">
      {/* ── Sidebar ── */}
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-zinc-800 bg-[#141414] md:flex">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-black">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-white">ArtVue</p>
            <p className="text-[10px] text-zinc-500">Creative Dashboard</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <SidebarItem active icon={<GridIcon />} label="My Artwork" />
          <SidebarItem icon={<ClockIcon />} label="In Progress" badge={inProgressCount} />
          <SidebarItem icon={<CheckIcon />} label="Completed" badge={doneCount} />
        </nav>

        {/* Stats */}
        <div className="mx-3 mb-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Progres</p>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Total Karya</span>
            <span className="font-semibold text-white">{works.length}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Selesai</span>
            <span className="font-semibold text-green-400">{doneCount}</span>
          </div>
          {works.length > 0 && (
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${(doneCount / works.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* User */}
        <div className="border-t border-zinc-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-white">
              {localUser?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {localUser?.username ?? "User"}
              </p>
              <p className="truncate text-[10px] text-zinc-500">
                {localUser?.email ?? ""}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col">
        {/* Top bar (mobile logo + add button) */}
        <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 md:px-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-black">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-wide">ArtVue</span>
          </div>

          <div className="hidden md:block">
            <h1 className="text-xl font-black tracking-tight">My Artwork</h1>
            <p className="text-xs text-zinc-500">Kelola dan pantau progres karya kamu</p>
          </div>

          <Link
            href="/create"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Tambah Karya
          </Link>
        </header>

        <main className="flex-1 overflow-auto px-5 py-6 md:px-8">
          {/* Search + Filter + Sort + View toggle */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari karya..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-600"
              />
            </div>

            {/* Filter status */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white"
              >
                {filterStatus === "All" ? (
                  "Semua Status"
                ) : (
                  <>
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[filterStatus]}`} />
                    {filterStatus}
                  </>
                )}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showFilterMenu && (
                <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
                  <button
                    onClick={() => { setFilterStatus("All"); setShowFilterMenu(false) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    Semua Status
                  </button>
                  {WORK_STATUS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setFilterStatus(s); setShowFilterMenu(false) }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                    >
                      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <button
              onClick={() => setSortNewest((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {sortNewest ? "Terbaru" : "Terlama"}
            </button>

            {/* View toggle */}
            <div className="ml-auto flex rounded-lg border border-zinc-800 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-8 w-8 items-center justify-center transition ${
                  viewMode === "grid" ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-500 hover:text-white"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex h-8 w-8 items-center justify-center transition ${
                  viewMode === "list" ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-500 hover:text-white"
                }`}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          ) : error ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
              <p className="text-zinc-400">{error}</p>
              <p className="text-xs text-zinc-600">Pastikan sudah login dengan benar.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                <ImageOff className="h-7 w-7 text-zinc-500" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  {works.length === 0 ? "Belum ada karya" : "Tidak ada hasil"}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {works.length === 0
                    ? "Mulai dengan menambahkan karya pertamamu."
                    : "Coba ubah filter atau kata pencarian."}
                </p>
              </div>
              {works.length === 0 && (
                <Link
                  href="/create"
                  className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Karya
                </Link>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((work) => (
                <WorkRow key={work.id} work={work} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/* ── Sidebar item ── */
function SidebarItem({
  icon,
  label,
  active,
  badge,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
        active
          ? "bg-zinc-800 font-semibold text-white"
          : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
      }`}
    >
      <span className="h-4 w-4 flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="rounded-full bg-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300">
          {badge}
        </span>
      )}
    </button>
  )
}

/* ── Work Card (grid) ── */
function WorkCard({ work }: { work: Work }) {
  return (
    <Link href={`/posts/${work.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800">
          {work.imageUrl ? (
            <Image
              src={work.imageUrl}
              alt={work.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-700">
              <ImageOff className="h-8 w-8" />
            </div>
          )}
          {/* Status badge on image */}
          <div className="absolute left-2 top-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${STATUS_COLOR[work.status]}`}>
              {work.status}
            </span>
          </div>
        </div>
        {/* Info */}
        <div className="p-3">
          <p className="truncate text-sm font-semibold text-white">{work.title}</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">{formatDate(work.createdAt)}</p>
        </div>
      </div>
    </Link>
  )
}

/* ── Work Row (list) ── */
function WorkRow({ work }: { work: Work }) {
  return (
    <Link href={`/posts/${work.id}`} className="group block">
      <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 transition hover:border-zinc-700">
        {/* Thumbnail */}
        <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
          {work.imageUrl ? (
            <Image
              src={work.imageUrl}
              alt={work.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-700">
              <ImageOff className="h-5 w-5" />
            </div>
          )}
        </div>
        {/* Title & date */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{work.title}</p>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
            <CalendarDays className="h-3 w-3" />
            {formatDate(work.createdAt)}
            {work.completedAt && (
              <>
                <span className="mx-1">·</span>
                <CheckCircle2 className="h-3 w-3 text-green-400" />
                <span className="text-green-400">{formatDate(work.completedAt)}</span>
              </>
            )}
          </div>
        </div>
        {/* Status */}
        <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[work.status]}`}>
          {work.status}
        </span>
      </div>
    </Link>
  )
}

/* ── Icon helpers ── */
function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}
function ClockIcon() {
  return <Clock className="h-4 w-4" />
}
function CheckIcon() {
  return <CheckCircle2 className="h-4 w-4" />
}
