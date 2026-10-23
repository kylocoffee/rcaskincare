# 🌸 RCA Skincare - Multi-Branch Clinic ERP & Stock Opname Management System

> **Versi:** 2.5.0 (Production Ready - Cloud Database & Social Share)  
> **Jaringan Cabang:**  
> 1. **🌿 Cabang Springhill:** Flagship Aesthetic & Laser Center (Palembang)  
> 2. **🏢 Cabang Sudirman:** Executive Dermatology & Glow Lounge (Palembang)  
> 3. **🌾 Cabang Pangkalan Balai:** Regional Clinical Wellness & Prescription Hub (Banyuasin)  
> **Status Database:** Google Sheets Cloud Database (Strictly Zero LocalStorage), Google Sheets API v4 (OAuth Bearer), Excel `.xlsx` Export, Progressive Web APK (Mobile Friendly), Gemini AI Advisor.  
> **Fitur Cetak & Share:** Cetak Struk / PDF, Unduh Berkas .txt & .html, Kirim WhatsApp Langsung, Web Share API (Sosial Media).  
> **Filosofi:** Well-Documented & Vibe Coding Friendly.

---

## 📑 DAFTAR ISI
1. [Kebijakan Database: Google Spreadsheet Cloud (Tanpa LocalStorage)](#1-kebijakan-database-google-spreadsheet-cloud-tanpa-localstorage)
2. [Fitur Cetak Struk, Download & Bagikan ke WhatsApp / Sosial Media](#2-fitur-cetak-struk-download--bagikan-ke-whatsapp--sosial-media)
3. [Halaman Khusus Kasir POS (Point of Sale Penjualan Cepat)](#3-halaman-khusus-kasir-pos-point-of-sale-penjualan-cepat)
4. [Pengeditan Profil Cabang & Penanggung Jawab (Head Doctor)](#4-pengeditan-profil-cabang--penanggung-jawab-head-doctor)
5. [Format Standar Stock Opname Farmasi 3 Cabang](#5-format-standar-stock-opname-farmasi-3-cabang)
6. [Fitur Filter Transaksi Fleksibel (Hari ke Hari, 7 Minggu & Per Bulan)](#6-fitur-filter-transaksi-fleksibel-hari-ke-hari-7-minggu--per-bulan)
7. [Reset Transaksi Per Bulan dengan Proteksi Password Admin](#7-reset-transaksi-per-bulan-dengan-proteksi-password-admin)
8. [Aplikasi Mobile & Fitur Unduh APK (Android & iOS)](#8-aplikasi-mobile--fitur-unduh-apk-android--ios)
9. [Struktur 5 Lembar Kerja Google Spreadsheet](#9-struktur-5-lembar-kerja-google-spreadsheet)
10. [Ekspor Rekapitulasi Excel (.xlsx)](#10-ekspor-rekapitulasi-excel-xlsx)
11. [Vibe Coding & Developer Reference Guide](#11-vibe-coding--developer-reference-guide)

---

## 1. KEBIJAKAN DATABASE: GOOGLE SPREADSHEET CLOUD (TANPA LOCALSTORAGE)
Sesuai arahan operasional resmi: **Seluruh data klinik RCA Skincare disimpan ke Google Spreadsheet sebagai cloud database terpusat, tanpa menggunakan browser localStorage**.

### Mengapa Tanpa LocalStorage?
- **Keamanan Data Pasien & Medis:** Komputer meja kasir atau HP yang dipakai bergantian oleh staf klinik tidak menyimpan data sensitif transaksi atau saldo di cache browser.
- **Single Source of Truth:** Seluruh 3 cabang (Springhill, Sudirman, Pangkalan Balai) mengacu ke satu file Google Spreadsheet yang sama di Google Drive klinik.
- **Pembersihan Otomatis:** Saat aplikasi dibuka, kunci-kunci data lokal lama dihapus secara otomatis.

### Cara Kerja Auto-Sync & Tarik Data:
1. **Auto-Save Realtime:** Ketika kasir menyelesaikan transaksi POS, melakukan stock opname, atau menambah pengeluaran operasional, sistem langsung menyinkronkan data tersebut ke Google Spreadsheet di latar belakang.
2. **Tarik Data Cloud (Pull):** Di jendela *Google Sheets*, tersedia tombol *"Tarik / Muat Ulang Data dari Google Spreadsheet"*. Tombol ini membaca lembar kerja terbaru dari Google Drive dan memperbarui memori aplikasi secara instan.

---

## 2. FITUR UNDUH BERKAS PDF (.PDF) & BAGIKAN KE SOSIAL MEDIA BERUPA BERKAS PDF
Menjawab keterbatasan perangkat mobile / smartphone yang tidak mendukung sistem cetak peramban (`window.print()`), sistem kini menyertakan generator dokumen PDF mandiri (`jspdf`):

### 1. Bagikan Berkas PDF ke Media Sosial (Bukan Berupa Link!)
- **Format Berkas Asli:** Menggunakan Web Share API (`navigator.share({ files: [pdfFile] })`) yang melampirkan berkas dokumen biner PDF secara langsung ke aplikasi sosial media (WhatsApp, Telegram, Gmail, AirDrop, dll.).
- **Tanpa Tautan Web:** Pasien menerima berkas PDF utuh di ruang obrolan WhatsApp yang dapat langsung dibuka, disimpan, atau dicetak tanpa perlu mengklik tautan eksternal.
- **Dukungan Desktop Fallback:** Jika dibuka di peramban komputer desktop yang tidak mendukung share berkas, sistem otomatis mengunduh berkas PDF ke memori perangkat agar kasir dapat melampirkannya langsung.

### 2. Unduh Berkas Dokumen PDF (.pdf) Langsung
- Tombol **"Unduh File PDF"** menghasilkan berkas PDF berformat A5 standar invoice klinik estetika.
- Lengkap dengan logo RCA Skincare, kop cabang, alamat, dokter penanggung jawab, nomor rekam medis, rincian obat & kuantitas, subtotal, potongan diskon, total bayar, serta anjuran & catatan dokter.

### 3. Opsi Tambahan: Teks WhatsApp & Cetak Printer Thermal
- **Kirim Teks WhatsApp:** Format teks ringkas tebal (*bold*) siap kirim langsung ke chat WhatsApp pasien.
- **Cetak Printer Thermal:** Dialog cetak peramban untuk komputer kasir yang tersambung kabel ke printer kasir thermal 58mm/80mm.

---

## 3. HALAMAN KHUSUS KASIR POS & DROPDOWN CABANG WAJIB (DEFAULT: NONE)
Untuk mengeliminasi kesalahan fatal kasir yang terburu-buru salah memilih cabang atau salah potong saldo stok:

### 1. Dropdown Pemilihan Cabang dengan Default 'NONE'
- Pilihan cabang di halaman Kasir POS menggunakan **Dropdown (`<select>`)** dengan nilai bawaan **"NONE"** (`⚠️ -- PILIH CABANG KLINIK (DEFAULT: NONE) --`).
- **Transaksi Dikunci Total Selama Status NONE:**
  - Tombol proses pembayaran dinonaktifkan (`disabled`) dengan tulisan *⚠️ WAJIB PILIH CABANG TERLEBIH DAHULU*.
  - Menambahkan produk atau tindakan medis akan memunculkan peringatan wajib memilih cabang.
  - Kartu produk menampilkan status `[PILIH CABANG]` dan menyembunyikan angka stok hingga cabang ditentukan.

### 2. Membuka Kunci Transaksi
- Setelah kasir secara sadar memilih cabang (*Springhill, Sudirman, atau Pangkalan Balai*):
  - Sistem langsung mengaktifkan pemantauan stok fisik riil untuk cabang tersebut.
  - Nama dokter penanggung jawab cabang otomatis terpasang.
  - Keranjang belanja dan tombol checkout aktif untuk memproses pembayaran dan mencetak berkas PDF.

### 3. Fitur Cepat di Meja Kasir:
- **Katalog Visual & Pencarian Instan:** Mencari produk berdasarkan nama, jenis, merk, atau kode SKU.
- **Tindakan Medis Kilat (Non-Stok):** Tombol preset tindakan langsung seperti Laser Melasma, Facial Acne, dan Konsultasi Dokter yang dapat ditambahkan ke struk tanpa memotong stok fisik.
- **Kalkulator Kasir & Uang Kembalian:** Pilihan metode bayar (QRIS, Tunai, Transfer BCA, Mandiri, Debit/Kredit) dan tombol nominal pecahan cepat (*Uang Pas, 50rb, 100rb, 200rb, 500rb*) dengan hitungan uang kembalian otomatis.

---

## 4. PENGEDITAN PROFIL CABANG & PENANGGUNG JAWAB (HEAD DOCTOR)
Setiap nama dokter penanggung jawab cabang dapat diperbarui secara dinamis:
1. **Langsung dari Dasbor:** Klik ikon pensil di samping teks *"Penanggung Jawab"* pada kartu cabang yang bersangkutan, atau klik langsung nama dokternya.
2. **Melalui Menu Admin:** Buka tab *Admin > Profil Cabang & Penanggung Jawab*. Anda dapat memperbarui:
   - Nama Dokter Penanggung Jawab (misal: *dr. Rina Cahyani, Sp.DVE*)
   - Gelar & Nomor SIP
   - Nomor Telepon / WhatsApp Hotline Cabang
   - Alamat Lengkap Operasional
   - Tagline Cabang
3. **Penyimpanan:** Perubahan otomatis disinkronkan ke Google Sheets tab `Profil_Cabang_RCA` dan otomatis tercetak di kop setiap struk kasir.

---

## 5. FORMAT STANDAR STOCK OPNAME FARMASI 3 CABANG
Format stock opname disusun sesuai dengan standar operasional farmasi dan pengawasan klinik kecantikan:

| No | Kolom | Keterangan & Contoh Nilai |
|:---|:---|:---|
| 1 | **No** | Nomor urut master barang (1, 2, 3...) |
| 2 | **SKU** | Kode unik produk (misal: `RCA-SRM-001`, `RCA-KRM-002`) |
| 3 | **Nama** | Nama lengkap obat/skincare (misal: *Brightening Glow Serum Vit C 15%*) |
| 4 | **Jenis** | Kategori sediaan (*Serum, Krim Pagi, Krim Malam, Toner, Facial Wash, Sunscreen, Ampul Injeksi, Peeling Solution, Salep Antibiotik, Masker*) |
| 5 | **Merk Produk** | Brand produk resmi (*RCA Skincare Premium, RCA Derma Care, RCA Acne Clear, RCA Whitening Clinic*) |
| 6 | **Jumlah** | Rincian stok per cabang (*Springhill, Sudirman, Pangkalan Balai*) serta total gabungan |
| 7 | **Harga Modal & Jual** | Harga beli/modal (HPP) dan Harga jual pasien beserta persentase margin keuntungan |
| 8 | **Keterangan** | Tanggal kadaluarsa (*Exp Date*), Nomor *Batch*, dan suhu penyimpanan khusus (*2-8°C* atau suhu ruang) |

---

## 6. FITUR FILTER TRANSAKSI FLEKSIBEL (HARI KE HARI, 7 MINGGU & PER BULAN)
Pada menu **Riwayat Transaksi Penjualan**, pengguna dapat menyaring data arus kas secara dinamis:
1. **Hari Ini (Today):** Transaksi kasir pada tanggal hari ini.
2. **Kemarin (Yesterday):** Transaksi hari kemarin untuk evaluasi harian.
3. **Hari ke Hari (Rentang Tanggal Kustom):** Menentukan tanggal mulai (*Dari Tanggal*) dan tanggal akhir (*Sampai Tanggal*) secara bebas.
4. **Per 7 Minggu Terakhir:** Mengagregasi mutasi selama 49 hari terakhir untuk evaluasi tren performa mingguan.
5. **Per Bulan:** Memilih periode bulan kalender tertentu (*Mei 2025, April 2025, dst.*).
6. **Semua Waktu:** Menampilkan seluruh rekam jejak tanpa batasan waktu.

---

## 7. RESET TRANSAKSI PER BULAN DENGAN PROTEKSI PASSWORD ADMIN
Untuk memudahkan proses tutup buku bulanan tanpa menghapus riwayat master obat atau data bulan lainnya:
1. Buka menu **Admin > Pencadangan & Reset** atau klik tombol **Reset Per Bulan** di halaman Transaksi.
2. Pilih periode bulan yang ingin dikosongkan (misal: `2025-05`).
3. Sistem memindai dan menampilkan preview jumlah invoice yang terdampak dan total nominal uangnya.
4. **Opsi Reversal Stok Otomatis:** Centang *"Kembalikan Stok Obat ke Cabang"* jika ingin mengembalikan kuantitas obat fisik ke saldo cabang bersangkutan.
5. **Proteksi Password Admin:** Masukkan Password Admin untuk otorisasi (default: `rca2026`).

---

## 8. APLIKASI MOBILE & FITUR UNDUH APK (ANDROID & IOS)
Aplikasi dioptimalkan 100% untuk layar smartphone:
- **Navigasi Bawah 1-Jempol (Bottom Dock):** Dasbor, Stok, Tombol Kasir POS Cepat, Transaksi, Admin, dan APK.
- **Instal APK di Android (Chrome):** Menu Titik Tiga (⋮) > *"Tambahkan ke Layar Utama"* / *"Install Aplikasi"*.
- **Instal di iPhone (Safari):** Ikon Bagikan (Share) > *"Add to Home Screen"*.

---

## 9. STRUKTUR 5 LEMBAR KERJA GOOGLE SPREADSHEET
Data klinik tersimpan rapi ke dalam 5 lembar kerja (*sheets*):
1. **`Ringkasan_Klinik_RCA`**: Omzet penjualan konsolidasi, total HPP, laba kotor, beban operasional, laba bersih riil, nilai aset persediaan stok, dan komparasi 3 cabang.
2. **`Stock_Opname_RCA`**: Master stok obat lengkap sesuai format wajib (No, SKU, Nama, Jenis, Merk, Jumlah per cabang, Harga Modal & Jual, Keterangan & Batch).
3. **`Pemasukan_Transaksi_RCA`**: Log invoice kasir, data pasien, no HP WA, dokter pemeriksa, rincian obat, diskon, dan metode pembayaran.
4. **`Pengeluaran_Beban_RCA`**: Pos beban kas keluar operasional per cabang, pihak penerima pembayaran, dan nomor kuitansi.
5. **`Profil_Cabang_RCA`**: Profil penanggung jawab medis 3 cabang, gelar/SIP, nomor WhatsApp cabang, dan alamat resmi.

---

## 10. EKSPOR REKAPITULASI EXCEL (.XLSX)
Tersedia tombol **Ekspor Excel (.xlsx)** di bilah atas, layar Stok Opname, dan layar Transaksi. Berkas Excel menyertakan header resmi klinik, format Rupiah, dan baris **GRAND TOTAL** otomatis untuk kebutuhan akuntansi.

---

## 11. VIBE CODING & DEVELOPER REFERENCE GUIDE
Sistem ini dibangun dengan arsitektur **Vibe Coding Friendly**:
- **Framework:** React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Backend:** Express (`server.ts`) dengan Vite middlewares dan endpoint Google Gemini AI.
- **Zero LocalStorage Policy:** Seluruh persistensi bisnis diarahkan langsung ke Google Sheets API v4.
- **Type Safety:** Seluruh interface terdefinisi ketat di `src/types/clinic.ts`.
- **Modular Services:**
  - `src/services/sheetsService.ts`: Engine baca dan tulis Google Sheets API v4.
  - `src/services/firebaseAuth.ts`: Autentikasi Google Workspace OAuth Bearer token in-memory.
  - `src/services/excelExportService.ts`: Generator spreadsheet Excel `.xlsx`.
  - `src/components/InvoicePrintModal.tsx`: Handler cetak, download thermal `.txt`/`.html`, dan WhatsApp share.

---
*Dikelola secara resmi untuk operasional klinik kecantikan RCA Skincare (Springhill, Sudirman, Pangkalan Balai).*
