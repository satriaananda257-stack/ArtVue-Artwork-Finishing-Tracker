# DeadLineKu — Backend

REST API untuk aplikasi DeadLineKu. Dibangun dengan Express 5, TypeScript, Drizzle ORM, dan MySQL.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **ORM**: Drizzle ORM
- **Database**: MySQL
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Storage**: Cloudinary
- **Upload**: Multer
- **Validasi**: Zod

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Konfigurasi environment

Buat file `.env` di folder `backend/`:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/deadlineku

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Migrasi database

```bash
npx drizzle-kit push
```

### 4. Jalankan server

```bash
npm run dev
```

Server berjalan di `http://localhost:5000`

## API Endpoints

### Auth

| Method | Endpoint                  | Deskripsi         | Auth |
|--------|---------------------------|-------------------|------|
| POST   | `/api/v1/auth/register`   | Daftar akun baru  | ✗    |
| POST   | `/api/v1/auth/login`      | Login & dapat JWT | ✗    |

#### Register
```json
{
  "username": "string (min 3)",
  "email": "string",
  "password": "string (min 6)"
}
```

#### Login
```json
{
  "email": "string",
  "password": "string"
}
```
Response: `{ token, user: { id, username, email, role } }`

---

### Works (Karya)

Semua endpoint butuh header `Authorization: Bearer <token>`

| Method | Endpoint              | Deskripsi                    |
|--------|-----------------------|------------------------------|
| GET    | `/api/v1/works`       | Ambil semua karya milik user |
| GET    | `/api/v1/works/:id`   | Ambil detail karya by ID     |
| POST   | `/api/v1/works`       | Buat karya baru              |
| PATCH  | `/api/v1/works/:id`   | Update karya                 |
| DELETE | `/api/v1/works/:id`   | Hapus karya                  |

#### POST / PATCH — Form fields

| Field         | Tipe   | Required |
|---------------|--------|----------|
| `title`       | string | ✓ (POST) |
| `description` | string | ✗        |
| `notes`       | string | ✗        |
| `status`      | enum   | ✗        |
| `image`       | file   | ✗        |

#### Status values
`Sketch` | `Line Art` | `Coloring` | `Shading` | `Background` | `Final Touch` | `Done`

---

### Users / Profile

| Method | Endpoint                    | Deskripsi           | Auth |
|--------|-----------------------------|---------------------|------|
| GET    | `/api/v1/users/profile`     | Ambil profil sendiri | ✓   |
| PATCH  | `/api/v1/users/profile`     | Update profil        | ✓   |

## Struktur Folder

```
src/
├── config/
│   ├── db.ts                    # Koneksi Drizzle + MySQL
│   ├── schema.ts                # Definisi tabel
│   ├── cloudinary.ts            # Konfigurasi Cloudinary
│   └── middleware/
│       ├── auth.middleware.ts   # JWT verify
│       └── upload.middleware.ts # Multer setup
├── controllers/
│   ├── auth/
│   ├── users/
│   └── works/
├── routes/
│   ├── auth/
│   ├── users/
│   └── works/
├── services/
│   └── cloudinary.services.ts
├── validations/
│   ├── auth.validation.ts
│   ├── profile.validation.ts
│   └── work.validation.ts
└── index.ts
```
