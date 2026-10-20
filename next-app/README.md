# DeadLineKu — Frontend

Aplikasi web untuk melacak progres karya seni. Dibangun dengan Next.js 16, Clerk, dan Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Auth**: Clerk
- **Icons**: Lucide React
- **Font**: Inter + Geist Mono

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Konfigurasi environment

Buat file `.env.local` di folder `next-app/`:

```env
# Clerk — ambil dari https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Redirect URL
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

### 3. Jalankan

```bash
npm run dev
```

Buka `http://localhost:3000`

## Halaman

| Route               | Deskripsi                                      |
|---------------------|------------------------------------------------|
| `/`                 | Landing page — redirect ke `/home` jika sudah login |
| `/login`            | Halaman login via Clerk                        |
| `/register`         | Halaman register via Clerk                     |
| `/home`             | Dashboard karya — list semua karya milik user  |
| `/create`           | Form tambah karya baru                         |
| `/posts/[id]`       | Detail karya — edit & hapus inline             |

## Fitur

- **Dashboard** — grid/list view, search, filter status, sort terbaru/terlama
- **Tambah karya** — upload gambar, judul, status, deskripsi, catatan
- **Detail karya** — edit semua field inline, ganti gambar, hapus dengan konfirmasi
- **Status badge** — warna berbeda per status progres
- **Logout** — via sidebar di halaman home

## Struktur Folder

```
app/
├── (login)/login/[[...rest]]/   # Halaman login (Clerk catch-all)
├── (register)/register/[[...rest]]/ # Halaman register (Clerk catch-all)
├── (home)/home/                 # Dashboard utama
├── (posts)/
│   ├── create/                  # Form tambah karya
│   └── posts/[id]/              # Detail karya
├── layout.tsx                   # Root layout + ClerkProvider
├── page.tsx                     # Landing page
└── globals.css

components/
├── ui/                          # Komponen UI (Button, dll)
└── theme-provider.tsx
```

## Catatan Penting

Backend menggunakan JWT sendiri (terpisah dari Clerk). Setelah login via Clerk, token JWT backend harus disimpan di `localStorage` dengan key `token` agar API call ke backend bisa berjalan.
