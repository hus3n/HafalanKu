perbaiki dengan teliti 
wajib memanggil skill berikut
- `C:\Users\M S I\.gemini\config\skills\cc-skill-coding-standards\SKILL.md` untuk perbaikan backend
dan memanggil skill berikut
- `C:\Users\M S I\.gemini\config\skills\antigravity-design-expert\SKILL.md`
- `C:\Users\M S I\.gemini\config\skills\motion-framer\SKILL.md` untuk memperbaiki frontend

berikan tanda pada task yang sudah dikerjakan. berhenti setelah mengerjakan 1 task tanpa menjalankan deploy ulang. dilarang push perbaikan/permbaharuan ke github sampai diperbolehkan, larang AI untuk mendiskripsikan ulang task.

# Task-01 [SELESAI]
tujuan : memperbaiki bug tampilan
perbaikan : dalam tampilan ponsel terdapat bug ketika berpindah kehalaman yang lain terdapat bug freeze halaman. ketika halaman di refresh freeze hilang. coba berpindah kehalaman lain lagi kembali freeze, refresh normal kembali. perbaiki juga soal tampilan yang terpotong (jika ada)


# Task-02 
tujuan : tambah fitur masa aktif
perbaikan : logika masa aktif akun belum dibuat, buat juga agar admin bisa menyetel masa aktif akun di management user guna trial dan menetapkan masa aktif dari akun yang didaftarkan. buat juga pilihan di halaman pendaftaran masa aktif yang diinginkan/ingin mencoba trial dahulu.

# Task-03 
Tujuan : Perubahan dan ajust system backup
perbaikan : Buat backup otomatis ke telegram adalah setiap 1 jam lakukan backup sekali. juga buat agar tombol backup manual juga otomatis mengirimkan backup ke telagram juga ketika di klik, jadi sekali di klik mengirimkan 2 backup : mendonwload ke divice user dan mengirim ke telgram bot.


# Task-04 
Tujuan : bug nomor
fitur baru : ada bug pada penyimpanan nomor whatsapp ketika mendaftar, karena yang ditampilkan di halaman management user pada tabel nomor whatsapp kosong padahal ketika mendaftar sudah diisi.

# Task-05 
Tujuan : pembaruan halaman hafalan awal dan update isian tabel, ubah fungsi kolom cari santri menjadi filter nama santri.
perbaikan : Penulisan surat yang telah dihafal buat dengan filter nama (rubah kolom cari santri menjadi filter untuk menampilkan hafalan santri), jika filter nama di isi nama santri tabel menampilkan daftar hafalan dari nama yang ditulis di filter nama. jika filter kosong maka tabel juga kosong. tambah data ayat yang udah dihafal dari suatu surat (hanya berlaku untuk surat yang diupdate dari catatan hafalan baru) misal "An Naziat 1-35" padahal An Naziat ada 46 ayat update datanya sesuai dengan data hafalan baru yang terbaru.

# Task-06 
Tujuan : perbaikan logika murajaah, pengahapusan fungsi murajaah otomatis, penambahan fitur edit pada tabel data murajaah hari ini.
update : Pada halaman murajaah 1 nama santri hanya boleh memiliki 1 jadwal murajaah pada hari yang sama. buat tombol hapus pada tabel murajaah hari ini agar jika ustadz keliru untuk membuat jadwal, jadwal bisa dihapus dan diganti dengan jadwal baru. dan jangan memasukkan hafalan yang tidak dipilih oleh ustadz (karena ketika tes fitur saya menemukan bahwa hafalan yang disimpan dihalaman hafalan awal otomatis ditambahkan ke jadwal murajaah, padahal fitur murajaah otomatis sudah kita hilangkan) sekarang seluruh jadwal murajaah hanya boleh di jadwalkan oleh user menggunakan fitur tambah data murajaah, sehingga fitur murajaah otomatis tidak dibutuhkan, hapus/hilangkan fitur.

# Task-07 
Tujuan : pembaharuan pada logika simpan hafalan dan update data tabel.
update : pada halaman hafalan riwayat tidak perlu menampilkan hafalan yang dimasukkan di halaman hafalan awal, halaman hafalan (riwayat hanya menampilkan riwayat hafalan baru saja.) sedangkan hafalan lama semua tersimpan dan akan ditampilkan jika ada nama yang ditulis dikolom filter nama (lihat task 5), pada halaman riwayat hafalan juga tabel menampilkan hafalan yang disimpan dari halaman hafalan awal padahal itu tidak diperlukan. halaman riwayat hafalan hanya menampilkan hafalan yang di catat dari halaman riwayat hafalan.

# Task-08 
Tujuan : update keterikatan antar data dan penampilan data
perbaiki : buat agar santri yang diinput oleh admin organisasi harus terikat dengan kelas yang ada, dan kelas yang ada terikat dengan ustadz/user yang didaftarkan lewat admin organisasi. jadi ketika ingin input kelas baru admin harus memilih kepada user mana dari organisasinya akan di tautkan. dan ketika ingin input nama siswa baru maka siswa tersebut harus di masukkan kesalah satu kelas yang terdaftar. sehingga nantinya user dari kelas lain tidak bisa melihat siswa dari kelas yang bukan tanggung jawabnya. misal user "nisa" di tautkan ke "kelas/kelompok A" maka ketika user "nisa" membuka halaman riwayat hafalan, yang ditampilkan hanya nama santri yang tergabung dalam" kelas A" begitupun user organisasi yang lain.

# Task Terakhir [SELESAI]
Tujuan : Memverifikasi ulang kode yang sudah diperbaiki agar tidak ada bug. dan cek apakah penulisan seluruh kode yang ada sudah sesuai dengan skill cc-skill-coding-standards 
aksi : panggil skill
- `C:\Users\M S I\.gemini\config\skills\cc-skill-coding-standards\SKILL.md` sebelum memulai verifikasi kode.