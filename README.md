# ArtVue

Platform untuk seniman digital melacak progres karya dari Sketch sampai Done.

## Struktur Project

```
ArtVue/
├── backend/        # REST API — Express + Drizzle ORM + MySQL
└── next-app/       # Frontend — Next.js 16 + Clerk Auth + Tailwind CSS
```

## Tech Stack

| Layer     | Teknologi                                      |
|-----------|------------------------------------------------|
| Frontend  | Next.js 16, React 19, Tailwind CSS v4          |
| Auth      | Clerk                                          |
| Backend   | Express 5, TypeScript, Drizzle ORM             |
| Database  | MySQL                                          |
| Storage   | Cloudinary (upload gambar karya)               |

## Cara Menjalankan

### 1. Clone & masuk ke folder

```bash
cd ArtVue
```

### 2. Jalankan Backend

```bash
cd backend
npm install
# Isi .env (lihat backend/README.md)
npm run dev
```

### 3. Jalankan Frontend

```bash
cd next-app
npm install
# Isi .env.local (lihat next-app/README.md)
npm run dev
```

Frontend berjalan di `http://localhost:3000`  
Backend berjalan di `http://localhost:5000`

## Fitur

- Register & Login via Clerk
- Dashboard karya dengan grid/list view
- Search dan filter berdasarkan status
- Tambah karya baru dengan upload gambar
- Detail karya dengan edit & hapus inline
- Status progres: Sketch → Line Art → Coloring → Shading → Background → Final Touch → Done
- Otomatis catat tanggal selesai saat status `Done`
