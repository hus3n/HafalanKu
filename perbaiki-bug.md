perbaiki dengan teliti 
wajib memanggil skill berikut
- `C:\Users\M S I\.gemini\config\skills\cc-skill-coding-standards\SKILL.md` untuk perbaikan backend
dan memanggil skill berikut
- `C:\Users\M S I\.gemini\config\skills\antigravity-design-expert\SKILL.md`
- `C:\Users\M S I\.gemini\config\skills\motion-framer\SKILL.md` untuk memperbaiki frontend

berikan tanda pada task yang sudah dikerjakan. berhenti setelah mengerjakan 1 task tanpa menjalankan deploy ulang. 

# Task-01 [SELESAI]
tujuan : memperbaiki logika riwayat khusus superadmin.
perbaikan : Halaman riwayat notifikasi dashboard admin bukan riwayat wa ke wali murid tapi riwayat wa ke admin/user perorangan seputar langganan aplikasi, info pembaruan dll.

# Task-02 [SELESAI]
tujuan : menambah fitur notifikasi masa aktif otomatis ke admin dan user perorangan
perbaikan : Buatkan pesan yang akan dikirim secara otomatis ketika masa aktif user/admin akan habis H-1 untuk mengingatkan mereka agar melakukan perpanjangan ke superadmin.

# Task-03 [SELESAI]
Tujuan : logika daftar akun dan direk pesan otomatis ke aplikasi whatsapp
perbaikan : Daftar akun ketika user memencet tombol daftar otomatis direct informasi akun ke WA admin untuk diaktifkan (membuka aplikasi wa dengan chat ke superadmin 6285229925593), simpan akun dalam keadaan pending (jangan langsung diaktifkan). admin akan mengaktifkan akun user lewat dashboard admin di halaman superadmin panel (buat agar admin bisa mengubah status akun aktif/tidak).

# Task-04 [SELESAI]
Tujuan : membuat akun trial untuk admin
fitur baru : Buat agar admin bisa membuat akun trial yang aktif selama 2/3/7 hari dan otomatis dihapus ketika akun sudah tidak aktif.

# Task-05 [SELESAI]
Tujuan : wajib mencantumkan nomor whatsapp ketika mendaftar atau didaftarkan.
perbaikan : Buat agar semua user harus mencantumkan nomor whatsapp ketika mendaftar/didaftarkan. dan simpan juga tampilkan di dashboard superadmin di kolom no wa user agar admin bisa memberikan pesan baik blast/otomatis ketika masa aktif user sudah hampir habis (seperti yang disebutkan di task 2.)

# Task-06 [SELESAI]
Tujuan : berbaikan bug
update : Ada error pada dropdown surat yang dihafal dihalaman awal santri, dropdown tidak terlihat dan tidak bisa dipilih.

# Task-07 [SELESAI]
Tujuan : perbaikan bug dan logika keterikan data antar user (organisai/perorangan), admin, dan superadmin.
update : Ada error pada tampilan data santri dari user yang didaftarkan oleh admin organisasi. data santri tidak ditampilkan padahal sudah ada, untuk mempermudah logika pemisahan data gunakan parameter ini :
- data hafalan selalu terikat dengan santri
- data santri terikat dengan admin organisasi dan user/ustadz sesuai kelas/kelompok yang dipilih
- data user yang didaftarkan admin organisasi terikat dengan organisasi dari admin yang mendaftarkan.
- data yang boleh ditampilkan kepada ustadz terikat dengan data kelas/kelompok dan begitu sebaliknya kelas terikat dengan ustadz.
- sedangkan data yang terikat dengan superadmin hanya data admin dan user non 
khusus untuk user perorangan datanya santri, hafalan, dan kelas hanya terimat oleh user itu sendiri.
- dengan keterikatan yang jelas, tidak boleh ada kebocoran data antar user, admin, dan superadmin. dan juga tidak ada data yang tidak ditampilkan padahal terikat dengan user yang membutuhkan

# Task-08 [SELESAI]
Tujuan : nomor superadmin default
perbaiki : Buat nomor 085229925593 sebagai nomor superadmin dan bisa diedit jika ingin dirubah dienv docker.

# Task-09 [SELESAI]
Tujuan : perbaikan bug
perbaikan : Sidebar admin masih menampilkan hafalan (riwayat) padahal akses ditolak. perbaiki tampilannya saja.

# Task Terakhir [SELESAI]
Tujuan : Memverifikasi ulang kode yang sudah diperbaiki agar tidak ada bug. dan cek apakah penulisan seluruh kode yang ada sudah sesuai dengan skill cc-skill-coding-standards 
aksi : panggil skill
- `C:\Users\M S I\.gemini\config\skills\cc-skill-coding-standards\SKILL.md` sebelum memulai verifikasi kode.