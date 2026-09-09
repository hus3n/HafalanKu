# Blueprint Rencana Eksekusi: SEO Pillar/Feature Pages

**Tujuan:** Mendominasi halaman pertama pencarian Google untuk kata kunci spesifik seperti *"pencatatan hafalan santri"*. Metode yang digunakan adalah memecah fitur menjadi halaman pilar khusus.

## 1. Struktur Laman & Rute Baru (Next.js App Router)
Membuat direktori baru khusus untuk memecah fitur di bawah folder Landing:
- `frontend/src/app/(landing)/fitur/pencatatan-hafalan/page.tsx`
- *(Opsional)* `frontend/src/app/(landing)/fitur/notifikasi-whatsapp/page.tsx`
- *(Opsional)* `frontend/src/app/(landing)/fitur/jadwal-murajaah/page.tsx`

## 2. Target Kata Kunci (Keywords) Halaman "Pencatatan Hafalan"
- **Primary Keywords:** Pencatatan hafalan santri, aplikasi buku mutabaah, sistem informasi tahfidz.
- **Tag `<title>`:** Aplikasi Pencatatan Hafalan Santri Otomatis & Digital — HafalanKu
- **Tag `<H1>`:** Sistem Pencatatan Setoran Hafalan Santri Tanpa Kertas (Paperless)

## 3. Desain Konten (Daur Ulang UI Komponen)
Memanfaatkan komponen visual yang sudah ada (Tailwind, Lucide, Framer Motion) agar efisien:
- **Feature Hero:** Menampilkan penjelasan ekstensif dari H1 spesifik beserta tombol *"Coba Gratis"*.
- **Feature Deep-Dive:** Panduan tahap demi tahap penginputan hafalan (Ustadz login -> Input -> Selesai).
- **Testimonials:** Menggunakan ulang data statistik TPQ/Lembaga sebagai trust signal (Social Proof).
- **FAQ Khusus:** Pertanyaan spesifik mengenai cara, keamanan, dan keuntungan fitur pencatatan, bukan FAQ aplikasi secara umum.
- **Internal Linking (Tautan Balik):** Tombol yang mengarah kembali ke beranda atau menjembatani ke fitur lain (misal: WA Gateway).

## 4. Pembaruan Navigasi (Silo Structure)
Untuk memastikan bot Google merayapi halaman baru dari URL tertinggi:
- Menu **Navbar:** Menambahkan tautan atau menu drop-down "Fitur" yang berisi tautan ke halaman pilar.
- Menu **Footer:** Menambahkan daftar vertikal "Fitur Utama" yang memudahkan pendaratan SEO dan akses pengguna.

## 5. Injeksi Skema (JSON-LD) Spesifik
- Menggunakan JSON-LD bertipe **`Article`**, **`WebPage`**, atau **`SoftwareApplication`** (untuk kategori sub-fitur).
- Hal ini agar Google semakin yakin bahwa konten meresolusi niat edukasi pencari mengenai cara rekapitulasi hafalan pondok.

---
*Catatan Dokumen:* Rencana ini disimpan untuk sewaktu-waktu bisa dieksekusi agar meningkatkan lalu lintas organik pendaftaran secara masif lewat Search Engine.
## 6. Intelijen Kompetitor & Strategi Positionig Lawan (Analisis hafalanku.com)
Kompetitor bernama serupa berfokus pada "Super Multi-Tenant" dengan tambahan fitur yang lebar (Audio, Keuangan/Tagihan SPP, Chat, Kalender). Berdasarkan instruksi, **HafalanKu forApp** akan MEMPERTAHANKAN PUSAT KEKUATANNYA (Core Focus) tanpa ikut menumpuk fitur (bloated). 
Strategi perlawanannya adalah:

- **Fokus Otomatisasi (Simplicity & Real-Time):** Mengedepankan integrasi WhatsApp Interaktif yang langsung dan tanpa hambatan. Input mudah, wali murid langsung terima laporan tanpa perlu repot login, aplikasi tak bikin HP Ustadz hang/lemot.
- **Keunggulan Teknis SEO (Next.js vs React SPA):** Aplikasi kita (`hafalanku.forapp.id`) dirakit menggunakan Next.js Server Side Rendering (SSR), yang notabenenya jauh lebih mudah diindeks oleh mesin perayap Google dibandingkan dengan arsitektur React SPA standar milik lawannya.
- **Strategi Artikel Perbandingan (Versus Tool):** Dalam jangka panjang, kita dapat merilis artikel informasional di bagian Blog untuk mengedukasi target pasar mengenai kelemahan sistem "Too Many Features" yang merepotkan dan merugikan manajemen TPQ, sembari memposisikan HafalanKu forApp sebagai solusi yang tuntas, spesifik, dan elegan.
- **Re-Branding Tagline Makro:** Menanamkan semantik SEO "HafalanKu - Sistem Setoran Tahfidz Otomatis via WhatsApp Interaktif" untuk menang secara tajam pada niche automasi komunikasi pesantren.
