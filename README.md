# HafalanKu

HafalanKu adalah webapp modern yang dirancang untuk memudahkan guru tahfidz, lembaga pendidikan Al-Qur'an, dan orang tua dalam mencatat, memantau, dan mengelola hafalan santri secara digital.

## Fitur Utama

1. **Digitalisasi Pencatatan Hafalan** — Sesuai surat dan ayat dengan predikat penilaian yang jelas.
2. **Jadwal Murajaah Otomatis** — Tergenerate dan terupdate secara otomatis berdasarkan data hafalan terkini.
3. **Notifikasi WhatsApp** — Mengirimkan progres hafalan langsung ke nomor WhatsApp wali murid (menggunakan Baileys).
4. **Backup & Restore** — Keamanan data menggunakan enkripsi AES-256 yang dikirimkan ke Telegram Bot.
5. **Multi-Tenant / Role Access** — Mendukung Superadmin, Admin (Lembaga), dan User (Perorangan).

## Tech Stack

- **Frontend:** Next.js 15 (React 19), Tailwind CSS v4, Motion (Framer Motion v11+), shadcn/ui, TanStack Query
- **Backend:** Node.js, Fastify 5.x, TypeScript
- **Database:** PostgreSQL (Relational) + MongoDB (NoSQL) + Redis (Cache)
- **ORM/ODM:** Prisma (PostgreSQL), Mongoose (MongoDB)
- **Integrasi Pihak Ketiga:** Baileys (WhatsApp Web API), Telegram Bot API

## Memulai Pengembangan Lokal

1. Pastikan Anda memiliki Docker, Node.js (v22+), dan npm (workspaces) terinstal di mesin Anda.
2. Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya:
   ```bash
   cp .env.example .env
   ```
3. Jalankan container database (PostgreSQL, MongoDB, Redis):
   ```bash
   npm run docker:dev
   ```
4. Install dependencies untuk semua workspace:
   ```bash
   npm install
   ```
5. Setup database (Prisma migrations & seed):
   ```bash
   npm run db:migrate
   ```
6. Jalankan server backend & frontend secara bersamaan:
   ```bash
   # Terminal 1: Backend
   npm run dev:backend
   
   # Terminal 2: Frontend
   npm run dev:frontend
   ```

## Struktur Repository

- `shared/` — Skema validasi (Zod), konstanta (114 surat Al-Qur'an), dan tipe data TypeScript bersama.
- `backend/` — REST API server yang dibangun dengan Fastify dan Prisma/Mongoose.
- `frontend/` — Aplikasi Next.js dengan arsitektur App Router.
- `docs/` — Dokumentasi API, Database, Deployment, dan Panduan Backup/Restore.
