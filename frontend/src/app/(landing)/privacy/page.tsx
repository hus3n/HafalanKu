import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Phone, 
  Server, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — HafalanKu',
  description: 'Kebijakan Privasi aplikasi platform HafalanKu. Pelajari bagaimana kami melindungi data pribadi, hafalan santri, dan kontak wali murid.',
};

export default function PrivacyPage() {
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
          <span className="text-foreground font-medium">Kebijakan Privasi</span>
        </div>

        {/* Header Title Section */}
        <div className="space-y-4 text-center sm:text-left border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> Dokumen Resmi Perlindungan Data
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-outfit text-foreground tracking-tight">
            Kebijakan Privasi <span className="text-primary">HafalanKu</span>
          </h1>
          <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Terakhir diperbarui pada: <strong>{lastUpdated}</strong>
          </p>
        </div>

        {/* Introduction Callout */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-3 leading-relaxed text-sm text-foreground/90">
          <p>
            Selamat datang di <strong>HafalanKu</strong> (layanan yang diakses melalui tautan platform <Link href="/" className="text-primary font-semibold hover:underline">hafalanku.forapp.id</Link>). Kami berkomitmen penuh untuk menghormati dan melindungi privasi serta keamanan data pribadi seluruh pengguna, pengajar/ustadz, santri, pengurus lembaga tahfidz/TPQ/pondok pesantren, dan wali santri.
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, memproses, dan melindungi informasi pribadi Anda saat menggunakan platform aplikasi HafalanKu.
          </p>
        </div>

        {/* Section 1: Informasi yang Kami Kumpulkan */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-primary" />
            1. Informasi yang Kami Kumpulkan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Data Akun & Lembaga
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nama lengkap, alamat surat elektronik (email), nomor telepon/WhatsApp, kata sandi terenkripsi, nama lembaga/TPQ/organisasi, dan foto profil.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Data Santri & Progres Tahfidz
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nama santri, nama kelas/halaqah, nama wali murid, nomor kontak WhatsApp wali murid, riwayat setoran hafalan (surah, ayat, predikat nilai), dan jadwal murajaah.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Data Komunikasi WhatsApp
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Log pengiriman pesan notifikasi setoran hafalan, jadwal murajaah otomatis, serta status konfirmasi dari nomor WhatsApp wali murid.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Log Teknis & Keamanan
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Alamat IP, jenis peramban (browser), sistem operasi, waktu akses, dan audit trail aktivitas akun untuk keperluan keamanan sistem dan pencegahan akses tidak sah.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Cara Penggunaan Informasi */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <Eye className="w-6 h-6 text-primary" />
            2. Penggunaan Informasi
          </h2>
          <div className="p-6 rounded-2xl bg-muted/30 border border-border/60 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>Kami menggunakan data yang dikumpulkan untuk tujuan operasional berikut:</p>
            <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm">
              <li>Menyediakan layanan pencatatan, rekapitulasi, dan pelaporan perkembangan hafalan Al-Qur'an santri.</li>
              <li>Menghasilkan dan mengelola jadwal murajaah terstruktur secara otomatis.</li>
              <li>Mengirimkan pesan pemberitahuan setoran dan pengingat murajaah ke nomor WhatsApp wali murid secara real-time.</li>
              <li>Memproses autentikasi, verifikasi akun, dan pemulihan kata sandi pengguna.</li>
              <li>Menyediakan cadangan data otomatis (*Cloud Auto-Backup*) ke penyimpanan aman demi menjaga integritas data lembaga Anda.</li>
              <li>Meningkatkan kualitas performa aplikasi, memperbaiki bug, dan mengembangkan fitur-fitur baru.</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Keamanan Data Berlapis */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-primary" />
            3. Keamanan & Enkripsi Data
          </h2>
          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
            <p className="text-sm text-foreground leading-relaxed">
              Kami menerapkan standar keamanan teknis tingkat tinggi untuk melindungi data Anda dari akses tanpa izin, kehilangan, atau pengubahan:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center space-y-1">
                <div className="font-bold text-sm text-primary font-mono">AES-256</div>
                <div className="text-[11px] text-muted-foreground">Enkripsi data kontak & nomor telepon wali santri</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center space-y-1">
                <div className="font-bold text-sm text-primary font-mono">Bcrypt (Salt 12)</div>
                <div className="text-[11px] text-muted-foreground">Hashing password satu arah yang kuat dan aman</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center space-y-1">
                <div className="font-bold text-sm text-primary font-mono">JWT + SSL/TLS</div>
                <div className="text-[11px] text-muted-foreground">Tokenisasi sesi aman & koneksi berstandar HTTPS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Pembagian Data Pihak Ketiga */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <Server className="w-6 h-6 text-primary" />
            4. Ketiadaan Penjualan Data & Pihak Ketiga
          </h2>
          <div className="p-6 rounded-2xl bg-muted/30 border border-border/60 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground">
              Kami TIDAK PERNAH dan TIDAK AKAN PERNAH menjual, menyewakan, atau memperdagangkan data pribadi Anda maupun data santri kepada pihak ketiga manapun untuk keperluan periklanan atau komersial.
            </p>
            <p className="text-xs">
              Data hanya diteruskan kepada penyedia infrastruktur pihak ketiga yang diperlukan untuk menjalankan fungsionalitas sistem (seperti WhatsApp Gateway API untuk pengiriman pesan notifikasi dan Telegram Bot API untuk pengiriman laporan backup).
            </p>
          </div>
        </div>

        {/* Section 5: Hak Pengguna */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-foreground flex items-center gap-2.5">
            <AlertCircle className="w-6 h-6 text-primary" />
            5. Hak-Hak Anda sebagai Pengguna
          </h2>
          <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>Anda memiliki hak-hak berikut terkait data pribadi Anda:</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li><strong>Hak Akses:</strong> Melihat seluruh data profil, data santri, dan laporan hafalan yang terdaftar pada akun Anda.</li>
              <li><strong>Hak Perbaikan:</strong> Memperbarui atau mengoreksi data pribadi dan data santri yang tidak akurat.</li>
              <li><strong>Hak Ekspor:</strong> Mengunduh laporan rekapitulasi hafalan santri dalam format dokumen PDF resmi kapan saja.</li>
              <li><strong>Hak Penghapusan:</strong> Meminta penonaktifan dan penghapusan akun serta data terkait melalui Superadmin.</li>
            </ul>
          </div>
        </div>

        {/* Section 6: Kontak & Bantuan */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center space-y-4">
          <h3 className="text-lg font-bold font-outfit text-foreground">
            Punya Pertanyaan Mengenai Kebijakan Privasi Ini?
          </h3>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Jika Anda memiliki pertanyaan, masukan, atau permohonan terkait perlindungan data pribadi Anda, silakan hubungi tim dukungan kami melalui layanan WhatsApp resmi:
          </p>
          <div className="pt-2">
            <a
              href="https://api.whatsapp.com/send?phone=6285229925593&text=Halo%20Admin%20HafalanKu,%20saya%20ingin%20bertanya%20terkait%20Kebijakan%20Privasi."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              <Phone className="w-4 h-4" /> Hubungi Superadmin via WhatsApp (0852-2992-5593)
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
