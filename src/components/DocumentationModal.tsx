import React from 'react';
import {
  BookOpen,
  X,
  FileSpreadsheet,
  Download,
  Building2,
  PackageCheck,
  AlertTriangle,
  ArrowRightLeft,
  Sparkles,
  CheckCircle2,
  Code2,
  Smartphone,
  Calendar,
  Lock,
  Layers,
  UserCheck,
  ShoppingCart,
  Printer,
  Share2,
  MessageCircle,
  Database,
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <BookOpen className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Panduan Penggunaan Sistem RCA Skincare ERP</h3>
              <p className="text-xs text-rose-200">
                Dokumentasi Lengkap 3 Cabang, Cetak &amp; Share Struk WhatsApp, Database Google Sheets (No LocalStorage)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed">
          {/* Section 1: Kebijakan Database Google Spreadsheet (Tanpa LocalStorage) */}
          <section className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              1. Kebijakan Database: Google Spreadsheet Cloud (Tanpa LocalStorage)
            </h4>
            <p className="text-emerald-800">
              Sesuai instruksi khusus operasional, seluruh data klinik <strong>TIDAK disimpan di browser localStorage</strong>. Seluruh entitas data utama hidup di <strong>Google Spreadsheet</strong> sebagai cloud database terpadu:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-emerald-900 font-medium">
              <li>
                <strong>Pembersihan Otomatis:</strong> Aplikasi membersihkan kunci-kunci data lokal saat dimuat, memastikan tidak ada data privat tertinggal di browser publik/komputer kasir.
              </li>
              <li>
                <strong>Penyimpanan 5 Tab Google Spreadsheet:</strong> Data disimpan di Google Sheets Anda:
                <br />• <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">Ringkasan_Klinik_RCA</code> (Ringkasan omzet, laba kotor &amp; bersih)
                <br />• <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">Stock_Opname_RCA</code> (Master stok obat 3 cabang &amp; mutasi)
                <br />• <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">Pemasukan_Transaksi_RCA</code> (Invoice pasien &amp; detail pembayaran)
                <br />• <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">Pengeluaran_Beban_RCA</code> (Kas keluar &amp; beban operasional klinik)
                <br />• <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">Profil_Cabang_RCA</code> (Dokter penanggung jawab, SIP, alamat &amp; kontak)
              </li>
              <li>
                <strong>Auto-Save Realtime:</strong> Setiap kali kasir menyelesaikan transaksi, memperbarui stok, atau menambah beban, data otomatis disimpan ke Google Spreadsheet.
              </li>
              <li>
                <strong>Tarik / Muat Ulang Data:</strong> Tombol <em>"Tarik Data dari Spreadsheet"</em> di modal Google Sheets memungkinkan sinkronisasi data antar komputer atau HP kasir lain secara instan.
              </li>
            </ul>
          </section>

          {/* Section 2: Unduh PDF & Bagikan Berkas PDF ke Sosial Media */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-rose-600" />
              2. Fitur Unduh Berkas PDF (.pdf) &amp; Berbagi Dokumen PDF ke Sosial Media
            </h4>
            <p className="text-slate-600">
              Menjawab kendala smartphone / perangkat mobile yang sering tidak mendukung sistem cetak peramban (<code className="bg-slate-100 px-1 py-0.2 rounded font-mono">window.print()</code>), sistem kini dilengkapi generator dokumen PDF mandiri (<code className="bg-slate-100 px-1 py-0.2 rounded font-mono">jspdf</code>):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                <strong className="text-emerald-900 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  Bagikan Dokumen PDF ke Medsos (Bukan Berupa Link)
                </strong>
                <p className="text-emerald-800">
                  Melampirkan berkas dokumen PDF asli secara langsung ke WhatsApp, Telegram, Gmail, atau AirDrop melalui Web Share API (<code className="font-mono text-[10px]">navigator.share({`{files: [pdfFile]}`})</code>). Penerima menerima berkas PDF yang dapat langsung dibuka tanpa perlu link eksternal.
                </p>
              </div>

              <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1">
                <strong className="text-rose-900 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-rose-600" />
                  Unduh Berkas PDF (.pdf) Langsung
                </strong>
                <p className="text-rose-800">
                  Mengunduh berkas biner PDF berformat A5 standar invoice klinik lengkap dengan logo RCA Skincare, kop cabang, rincian obat, dokter penanggung jawab, dan nomor rekam medis.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <strong className="text-slate-900 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Kirim Teks WhatsApp Cepat
                </strong>
                <p className="text-slate-600">
                  Opsi alternatif berupa pesan teks ringkas terformat markdown tebal (*bold*) yang membuka chat kontak pasien secara langsung.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <strong className="text-slate-900 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  Cetak Thermal / Printer Biasa
                </strong>
                <p className="text-slate-600">
                  Dialog cetak peramban standar bagi komputer kasir desktop yang terhubung langsung kabel ke printer nota thermal 58mm/80mm.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Halaman Kasir POS & Dropdown Cabang Wajib (Default: NONE) */}
          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-rose-600" />
              3. Halaman Khusus Kasir POS &amp; Dropdown Cabang Wajib (Default: NONE)
            </h4>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <strong className="text-amber-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Pencegahan Human-Error: Wajib Pilih Cabang (Default: NONE)
              </strong>
              <p className="text-amber-900 text-[11px]">
                Untuk menghindari kasir yang terburu-buru dan salah menggunakan cabang, sistem POS mengharuskan pemilihan cabang melalui <strong>Dropdown</strong> dengan nilai awal <strong>"NONE"</strong>.
                <br />• <strong>Transaksi Dikunci:</strong> Selama cabang berstatus <em>NONE</em>, tombol bayar dinonaktifkan (<code className="font-mono text-[10px]">disabled</code>) dan penambahan produk ke keranjang dicegah.
                <br />• <strong>Aktivasi Stok Riil:</strong> Setelah kasir memilih cabang (Springhill, Sudirman, atau Pangkalan Balai), sistem akan mengaktifkan stok fisik cabang tersebut dan membuka kunci transaksi.
              </p>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>Pencarian Cepat &amp; Filter Sediaan:</strong> Temukan obat atau krim dalam hitungan detik berdasarkan nama atau jenis sediaan.
              </li>
              <li>
                <strong>Tindakan Medis Kilat:</strong> 1-klik untuk menambahkan Laser Melasma, Facial Acne, atau Konsultasi Dokter tanpa perlu stok fisik.
              </li>
              <li>
                <strong>Kalkulator Tunai Cepat:</strong> Tombol pecahan uang tunai (50rb, 100rb, 200rb, 500rb) dan kalkulasi kembalian otomatis.
              </li>
            </ul>
          </section>

          {/* Section 4: Pengeditan Nama Penanggung Jawab Cabang */}
          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-rose-600" />
              4. Pengeditan Nama Penanggung Jawab Cabang
            </h4>
            <p className="text-slate-600">
              Nama dokter penanggung jawab setiap cabang dapat disesuaikan kapan saja:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>Dari Dasbor:</strong> Klik tombol pensil pada kartu cabang untuk mengubah Nama Dokter, Gelar/SIP, Nomor WhatsApp, dan Alamat Lengkap.
              </li>
              <li>
                <strong>Dari Admin:</strong> Buka tab <em>Admin &gt; Profil Cabang &amp; Penanggung Jawab</em>.
              </li>
              <li>
                <strong>Tersinkronisasi ke Google Sheets:</strong> Data penanggung jawab otomatis masuk ke lembar kerja <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">Profil_Cabang_RCA</code> dan otomatis dicetak di kop setiap struk invoice.
              </li>
            </ul>
          </section>

          {/* Section 5: Filter Waktu & Reset Bulanan Berpassword */}
          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              5. Filter Transaksi Fleksibel &amp; Reset Bulanan Berpassword
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <strong className="text-slate-900 block">📅 Filter Hari ke Hari &amp; Rentang Tanggal</strong>
                Pilih filter <em>Hari Ini</em>, <em>Kemarin</em>, atau <em>Rentang Tanggal Kustom</em> untuk menyaring transaksi dan arus kas.
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <strong className="text-slate-900 block">⏱ Per 7 Minggu &amp; Per Bulan</strong>
                Agregasi data 49 hari terakhir atau pilih bulan spesifik (misal: Mei 2025) untuk audit pembukuan.
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl col-span-1 sm:col-span-2">
                <strong className="text-amber-900 flex items-center gap-1.5 mb-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Reset Transaksi Bulanan dengan Password
                </strong>
                Memungkinkan admin menghapus transaksi bulan tertentu saat tutup buku dengan verifikasi password admin (default: <code className="bg-white px-1 py-0.5 rounded text-rose-600 font-mono font-bold">rca2026</code>) serta opsi mengembalikan stok produk yang pernah terjual kembali ke cabang terkait (Reversal Stok Otomatis).
              </div>
            </div>
          </section>

          {/* Section 6: Mobile Friendly & Unduh APK */}
          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              6. Mobile Friendly &amp; Fitur Unduh APK HP
            </h4>
            <p className="text-slate-600">
              Aplikasi mendukung pemasangan PWA (Progressive Web App) instan yang berfungsi serupa file APK Android tanpa konsumsi memori berlebih. Cukup klik tombol <strong>Unduh APK</strong> di bilah atas atau navigasi bawah untuk melihat panduan 1-klik instalasi di layar utama smartphone kasir Anda.
            </p>
          </section>

          {/* Section 7: Vibe Coding Friendly Architecture */}
          <section className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-rose-600" />
              Vibe Coding Friendly Architecture
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Arsitektur aplikasi dirancang modular, clean, dan mandiri:
              <br />• <strong>Single Source of Truth:</strong> Google Spreadsheet Cloud Database via Google Sheets API v4 (Strictly Zero LocalStorage untuk data bisnis).
              <br />• <strong>Type Safety:</strong> Seluruh model terdefinisi ketat di <code className="font-mono bg-white px-1 py-0.2 rounded text-slate-800">src/types/clinic.ts</code>.
              <br />• <strong>Desain Responsif:</strong> Memanfaatkan Tailwind CSS dengan atomic classes tanpa CSS eksternal.
              <br />• <strong>Ekstensibilitas:</strong> AI agent atau developer berikutnya dapat menambahkan fitur analitik baru dengan mudah tanpa merusak alur data yang telah terbangun.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>RCA Skincare Management ERP System v2.5 (Well Documented)</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-colors shadow-xs"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
