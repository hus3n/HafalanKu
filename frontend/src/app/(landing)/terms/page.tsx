import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  FileCheck2, 
  UserCheck, 
  Scale, 
  AlertOctagon, 
  HelpCircle, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  Phone,
  ShieldCheck,
  Zap,
  Building
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan — HafalanKu',
  description: 'Syarat & Ketentuan penggunaan platform HafalanKu. Ketentuan layanan pencatatan hafalan Quran, lisensi penggunaan, dan hak akses akun.',
};

export default function TermsPage() {
  const lastUpdated = '23 Agustus 2026';

  return (
    <div className="pt-32 pb-24 relative overflow-hidden bg-background">
      {/* Background Decor Ambient */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-96 bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-12 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Syarat & Ketentuan</span>
        </div>

        {/* Header Title Section */}
        <div className="space-y-4 text-center sm:text-left border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            <FileCheck2 className="w-4 h-4" /> Perjanjian Penggunaan Layanan
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-outfit text-foreground tracking-tight">
            Syarat & Ketentuan <span className="text-primary">HafalanKu</span>
          </h1>
          <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Terakhir diperbarui pada: <strong>{lastUpdated}</strong>
          </p>
        </div>

        {/* Introduction Callout */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-3 leading-relaxed text-sm text-foreground/90">
          <p>
            Harap membaca <strong>Syarat dan Ketentuan</strong> ini dengan saksama sebelum mendaftar, mengakses, atau menggunakan layanan platform <strong>HafalanKu</strong> (<Link href="/" className="text-primary font-semibold hover:underline">hafalanku.forapp.id</Link>).
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Dengan mendaftar atau menggunakan layanan kami, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat dengan seluruh syarat dan ketentuan yang tercantum dalam dokumen ini.
          </p>
        </div>

        {/* Section 1: Definisi & Lingkup Layanan */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <Building className="w-6 h-6 text-primary" />
            1. Definisi & Lingkup Layanan
          </h2>
          <div className="p-6 rounded-2xl bg-muted/30 border border-border/60 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong>HafalanKu</strong> adalah platform aplikasi manajemen tahfidz berbasis web yang dirancang untuk mempermudah lembaga pendidikan Islam (Pondok Pesantren, TPQ, Rumah Tahfidz, Sekolah Islam) maupun pengajar perorangan dalam mencatat setoran hafalan, mengatur jadwal murajaah otomatis, dan mengirimkan laporan kepada wali murid melalui integrasi WhatsApp.
            </p>
            <ul className="space-y-1.5 list-disc list-inside mt-2">
              <li><strong>Pengguna:</strong> Setiap individu atau perwakilan lembaga yang terdaftar dan memiliki akun aktif di platform.</li>
              <li><strong>Admin Organisasi:</strong> Pengguna yang memiliki wewenang mengelola data lembaga, ustadz/pengajar, dan santri di bawah naungan lembaganya.</li>
              <li><strong>Superadmin:</strong> Pengelola utama sistem yang bertindak dalam pengawasan operasional, aktivasi lisensi, dan pemeliharaan platform.</li>
            </ul>
          </div>
        </div>

        {/* Section 2: Pendaftaran & Aktivasi Akun */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-primary" />
            2. Pendaftaran Akun & Kebijakan Verifikasi
          </h2>
          <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <ul className="space-y-2 list-disc list-inside">
              <li>Pendaftar wajib memberikan data yang akurat, lengkap, dan benar saat mengisi formulir pendaftaran akun baru.</li>
              <li>Akun baru yang didaftarkan akan berstatus <em>Pending / Verifikasi</em> dan memerlukan aktivasi oleh Superadmin sebelum dapat digunakan untuk masuk (login) ke sistem.</li>
              <li>Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi (password) dan seluruh aktivitas yang terjadi di dalam akun miliknya.</li>
              <li>Satu akun hanya boleh digunakan oleh individu atau lembaga yang berhak sesuai paket lisensi yang dipilih.</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Integrasi WhatsApp & Kebijakan Pengiriman Pesan */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-primary" />
            3. Ketentuan Layanan WhatsApp Gateway
          </h2>
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 text-xs sm:text-sm text-foreground/90 leading-relaxed">
            <p>
              Platform HafalanKu menyediakan fitur pengiriman notifikasi otomatis ke nomor WhatsApp wali murid:
            </p>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground text-xs sm:text-sm">
              <li>Pengguna wajib memastikan bahwa nomor WhatsApp wali murid yang dimasukkan telah mendapatkan persetujuan dari yang bersangkutan untuk menerima notifikasi tahfidz santri.</li>
              <li>Dilarang keras menggunakan fitur WhatsApp Gateway untuk mengirim pesan massal yang bersifat spam, iklan komersial tidak sah, penipuan, atau konten yang melanggar hukum syariah maupun hukum positif Republik Indonesia.</li>
              <li>Keterlambatan atau kegagalan pengiriman pesan akibat gangguan jaringan WhatsApp atau penangguhan nomor oleh pihak WhatsApp/Meta berada di luar kendali langsung platform HafalanKu.</li>
            </ul>
          </div>
        </div>

        {/* Section 4: Masa Aktif, Uji Coba, & Perpanjangan Lisensi */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-primary" />
            4. Masa Aktif & Perpanjangan Langganan
          </h2>
          <div className="p-6 rounded-2xl bg-muted/30 border border-border/60 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <ul className="space-y-2 list-disc list-inside">
              <li>Pengguna baru berhak menikmati masa uji coba gratis (*Free Trial*) sesuai ketentuan promo yang berlaku pada saat pendaftaran.</li>
              <li>Setelah masa aktif berakhir, akun akan beralih ke status kadaluarsa. Pengguna dapat menghubungi Superadmin untuk melakukan perpanjangan lisensi.</li>
              <li>Data santri dan rekapitulasi hafalan akan tetap tersimpan aman di database selama periode tenggang untuk memungkinkan proses perpanjangan akun tanpa kehilangan riwayat data.</li>
            </ul>
          </div>
        </div>

        {/* Section 5: Larangan Penggunaan */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-500" />
            5. Larangan Penggunaan & Pembatasan Akun
          </h2>
          <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground">Pengguna dilarang keras untuk:</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Melakukan rekayasa balik (*reverse engineering*), pembobolan, atau penyusupan ke sistem keamanan database HafalanKu.</li>
              <li>Mengunggah file berbahaya, skrip injeksi SQL, atau program perusak (*malware*).</li>
              <li>Menggunakan akun pihak lain tanpa izin sah dari pemilik akun yang bersangkutan.</li>
            </ul>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              Pelanggaran terhadap ketentuan ini dapat mengakibatkan penonaktifan akun secara sepihak dan penghapusan permanen dari platform tanpa pemberitahuan sebelumnya.
            </p>
          </div>
        </div>

        {/* Section 6: Pembatasan Tanggung Jawab & Hukum */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-primary" />
            6. Pembatasan Tanggung Jawab & Hukum yang Berlaku
          </h2>
          <div className="p-6 rounded-2xl bg-muted/30 border border-border/60 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Syarat dan Ketentuan ini tunduk pada dan ditafsirkan sesuai dengan hukum yang berlaku di <strong>Negara Kesatuan Republik Indonesia</strong>.
            </p>
            <p>
              HafalanKu tidak bertanggung jawab atas kerugian tidak langsung atau kehilangan data yang diakibatkan oleh kelalaian pengguna dalam menjaga kerahasiaan kata sandi akun miliknya sendiri.
            </p>
          </div>
        </div>

        {/* Section 7: Kontak Dukungan */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center space-y-4">
          <h3 className="text-lg font-bold font-outfit text-foreground">
            Butuh Bantuan Mengenai Ketentuan Layanan?
          </h3>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Tim kami siap membantu Anda mengenai aktivasi akun, perpanjangan paket lisensi lembaga, atau pertanyaan terkait ketentuan layanan.
          </p>
          <div className="pt-2">
            <a
              href="https://api.whatsapp.com/send?phone=6285229925593&text=Halo%20Admin%20HafalanKu,%20saya%20ingin%20berkonsultasi%20mengenai%20Syarat%20dan%20Ketentuan%20Layanan."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              <Phone className="w-4 h-4" /> Hubungi Layanan Pelanggan (0852-2992-5593)
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
