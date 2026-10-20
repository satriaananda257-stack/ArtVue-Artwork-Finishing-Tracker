"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  Loader2,
  Pencil,
  Trash2,
  ImageOff,
  CalendarDays,
  CheckCircle2,
  X,
  Save,
  ImagePlus,
} from "lucide-react"
import { useRef } from "react"

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
  userId: number
  title: string
  imageUrl: string | null
  description: string | null
  notes: string | null
  status: WorkStatus
  createdAt: string
  completedAt: string | null
  username: string | null
}

const STATUS_COLOR: Record<WorkStatus, string> = {
  Sketch: "bg-zinc-700 text-zinc-300",
  "Line Art": "bg-blue-900/50 text-blue-300",
  Coloring: "bg-purple-900/50 text-purple-300",
  Shading: "bg-orange-900/50 text-orange-300",
  Background: "bg-teal-900/50 text-teal-300",
  "Final Touch": "bg-yellow-900/50 text-yellow-300",
  Done: "bg-green-900/50 text-green-300",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editStatus, setEditStatus] = useState<WorkStatus>("Sketch")
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const token =
    typeof window !== "undefined" ? (localStorage.getItem("token") ?? "") : ""

  useEffect(() => {
    const fetchWork = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:5000/api/v1/works/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.message ?? "Karya tidak ditemukan.")
          return
        }
        setWork(data.data.work)
      } catch {
        setError("Gagal memuat data. Coba lagi.")
      } finally {
        setLoading(false)
      }
    }
    fetchWork()
  }, [id, token])

  const startEdit = () => {
    if (!work) return
    setEditTitle(work.title)
    setEditDescription(work.description ?? "")
    setEditNotes(work.notes ?? "")
    setEditStatus(work.status)
    setEditImageFile(null)
    setEditImagePreview(null)
    setSaveError(null)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setSaveError(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditImageFile(file)
    setEditImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!editTitle.trim()) {
      setSaveError("Judul wajib diisi.")
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const formData = new FormData()
      formData.append("title", editTitle)
      formData.append("description", editDescription)
      formData.append("notes", editNotes)
      formData.append("status", editStatus)
      if (editImageFile) formData.append("image", editImageFile)

      const res = await fetch(`http://localhost:5000/api/v1/works/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.message ?? "Gagal menyimpan perubahan.")
        return
      }
      setWork(data.data.work)
      setEditing(false)
    } catch {
      setSaveError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/v1/works/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        router.push("/home")
      } else {
        const data = await res.json()
        alert(data.message ?? "Gagal menghapus karya.")
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus.")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  /* ── Loading / Error states ── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (error || !work) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#141414] text-white">
        <p className="text-zinc-400">{error ?? "Karya tidak ditemukan."}</p>
        <Link href="/dashboard" className="text-sm text-white underline">
          Kembali ke Dashboard
        </Link>
      </div>
    )
  }

  const displayImage = editing && editImagePreview ? editImagePreview : work.imageUrl

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-[#141414]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            href="/home"
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
          <h1 className="text-sm font-semibold tracking-wide">Detail Karya</h1>
          {/* Actions */}
          {!editing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={startEdit}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                aria-label="Edit karya"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-red-900/30 hover:text-red-400"
                aria-label="Hapus karya"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEdit}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                aria-label="Batal edit"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex h-8 items-center gap-1.5 rounded-md bg-white px-3 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Simpan
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={work.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-600">
              <ImageOff className="h-10 w-10" />
              <span className="text-sm">Tidak ada gambar</span>
            </div>
          )}
          {/* Replace image button when editing */}
          {editing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-sm transition hover:bg-black/90"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Ganti Gambar
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Save error */}
        {saveError && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {saveError}
          </p>
        )}

        {/* Title + Status */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {editing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-lg font-bold text-white outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          ) : (
            <h2 className="flex-1 text-2xl font-black tracking-tight">{work.title}</h2>
          )}

          {editing ? (
            <div className="flex flex-wrap gap-2">
              {WORK_STATUS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setEditStatus(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    editStatus === s
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <span
              className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[work.status]}`}
            >
              {work.status}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Dibuat {formatDate(work.createdAt)}
          </span>
          {work.completedAt && (
            <span className="flex items-center gap-1.5 text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Selesai {formatDate(work.completedAt)}
            </span>
          )}
          {work.username && (
            <span className="text-zinc-500">oleh {work.username}</span>
          )}
        </div>

        {/* Divider */}
        <hr className="border-zinc-800" />

        {/* Description */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Deskripsi
          </h3>
          {editing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Ceritakan tentang karya ini..."
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          ) : work.description ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {work.description}
            </p>
          ) : (
            <p className="text-sm italic text-zinc-600">Tidak ada deskripsi.</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Catatan
          </h3>
          {editing ? (
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Catatan pribadi, deadline, referensi, dll..."
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          ) : work.notes ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {work.notes}
            </p>
          ) : (
            <p className="text-sm italic text-zinc-600">Tidak ada catatan.</p>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#1c1c1c] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-base font-bold text-white">Hapus Karya?</h2>
            <p className="mb-6 text-sm text-zinc-400">
              Karya <span className="font-semibold text-white">{work.title}</span> akan
              dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
