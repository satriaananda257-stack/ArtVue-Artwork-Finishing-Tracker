"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ImagePlus, X, ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"

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

export default function CreateWorkPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<WorkStatus>("Sketch")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Title wajib diisi.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("title", title)
      if (description) formData.append("description", description)
      if (notes) formData.append("notes", notes)
      formData.append("status", status)
      if (imageFile) formData.append("image", imageFile)

      const res = await fetch(`/api/v1/works`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? "Gagal membuat karya.")
        return
      }

      router.push(`/posts/${data.data.work.id}`)
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-sm font-semibold tracking-wide">Tambah Karya</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Gambar Karya
            </label>
            {imagePreview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-700">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                <ImagePlus className="h-8 w-8 text-zinc-500" />
                <span className="text-sm text-zinc-500">Klik untuk upload gambar</span>
                <span className="text-xs text-zinc-600">PNG, JPG, WEBP • Maks 5MB</span>
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

          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-zinc-400">
              Judul <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nama karya kamu..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Status Progres
            </label>
            <div className="flex flex-wrap gap-2">
              {WORK_STATUS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    status === s
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-400">
              Deskripsi{" "}
              <span className="text-zinc-600">(opsional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan tentang karya ini..."
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-zinc-400">
              Catatan{" "}
              <span className="text-zinc-600">(opsional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan pribadi, deadline, referensi, dll..."
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Menyimpan..." : "Simpan Karya"}
          </button>
        </form>
      </main>
    </div>
  )
}
