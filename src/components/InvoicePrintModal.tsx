import React, { useState } from 'react';
import {
  Printer,
  X,
  Share2,
  Download,
  Copy,
  Check,
  MessageCircle,
  FileText,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { Transaction, BranchInfo } from '../types/clinic';
import { BRANCHES } from '../data/initialData';
import { generateInvoicePdf } from '../services/pdfReceiptService';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  branches?: BranchInfo[];
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  transaction,
  branches,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !transaction) return null;

  const branchList = branches && branches.length > 0 ? branches : BRANCHES;
  const branchInfo = branchList.find((b) => b.id === transaction.branch) || branchList[0];

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  // Trigger standard browser print
  const handlePrint = () => {
    window.print();
  };

  // 1. Download Real Binary PDF File (.pdf)
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const { doc, fileName } = generateInvoicePdf(transaction, branchInfo);
      doc.save(fileName);
      setShareFeedback(`Berkas PDF "${fileName}" berhasil diunduh ke memori perangkat!`);
      setTimeout(() => setShareFeedback(null), 4000);
    } catch (err: any) {
      console.error('Download PDF error:', err);
      setShareFeedback('Gagal membuat berkas PDF: ' + (err.message || 'Error'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. Share PDF FILE directly to social media (WhatsApp, Telegram, etc.)
  // Specifically requested: "bagikan ke social media pun berupa PDF bukan link karena device mobile tidak support sistem print / window print."
  const handleSharePdfFile = async () => {
    setIsGeneratingPdf(true);
    setShareFeedback(null);
    try {
      const { file, blob, fileName } = generateInvoicePdf(transaction, branchInfo);

      // Check if navigator.canShare supports sharing files
      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `Struk Invoice RCA Skincare - ${transaction.id}`,
          text: `Struk transaksi resmi ${branchInfo.name} untuk pasien ${transaction.patientName}. Berkas struk terlampir dalam format PDF.`,
        });
        setShareFeedback('Berkas PDF struk berhasil dibagikan ke media sosial!');
        setTimeout(() => setShareFeedback(null), 3000);
      } else {
        // Fallback for browsers without Web Share File API support (e.g. desktop Chrome):
        // Automatically download the PDF file and notify user
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setShareFeedback(
          'Berkas PDF telah diunduh ke perangkat Anda! Browser desktop tidak mendukung share file langsung, silakan lampirkan file PDF yang baru saja diunduh ke WhatsApp / Medsos.'
        );
        setTimeout(() => setShareFeedback(null), 6000);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share PDF error:', err);
        setShareFeedback('Gagal membagikan PDF: ' + (err.message || 'Error'));
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Generate clean WhatsApp text fallback
  const generateWhatsAppText = () => {
    const itemsList = transaction.items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.nama}*\n   _${it.qty} x ${formatRp(it.hargaSatuan)}_ = *${formatRp(it.subtotal)}*`
      )
      .join('\n');

    return `🧾 *STRUK INVOICE RESMI RCA SKINCARE*
━━━━━━━━━━━━━━━━━━━━━
🏥 *Cabang:* ${branchInfo.name}
📍 *Alamat:* ${branchInfo.address}
📞 *Telp/WA:* ${branchInfo.phone}
━━━━━━━━━━━━━━━━━━━━━
📄 *No. Invoice:* \`${transaction.id}\`
📅 *Tanggal:* ${transaction.timestamp} WIB
👤 *Nama Pasien:* *${transaction.patientName}*
🩺 *No. RM:* ${transaction.medicalRecordNo}
👩‍⚕️ *Dokter/PIC:* ${transaction.attendingDoctor}
💳 *Metode Pembayaran:* ${transaction.paymentMethod} (*${transaction.paymentStatus}*)
━━━━━━━━━━━━━━━━━━━━━
🛍️ *RINCIAN TINDAKAN & OBAT:*
${itemsList}
━━━━━━━━━━━━━━━━━━━━━
💵 *Subtotal:* ${formatRp(transaction.subtotal)}
${transaction.discount > 0 ? `🎁 *Diskon:* -${formatRp(transaction.discount)}\n` : ''}💰 *TOTAL DIBAYAR:* *${formatRp(transaction.total)}*
━━━━━━━━━━━━━━━━━━━━━
${transaction.notes ? `📝 *Anjuran & Catatan Dokter:*\n_${transaction.notes}_\n━━━━━━━━━━━━━━━━━━━━━\n` : ''}
_Terima kasih telah mempercayakan perawatan kulit Anda pada RCA Skincare. Simpan struk ini untuk rujukan konsultasi dokter berikutnya._ ✨`;
  };

  // Direct WhatsApp chat link
  const handleShareWhatsAppChat = () => {
    const text = generateWhatsAppText();
    let phone = transaction.patientPhone ? transaction.patientPhone.replace(/[^0-9]/g, '') : '';
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }

    const waUrl = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank');
  };

  // Copy text to clipboard
  const handleCopyText = () => {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setShareFeedback('Teks rincian struk berhasil disalin ke clipboard!');
    setTimeout(() => {
      setCopied(false);
      setShareFeedback(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[94vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Header Action Bar (Hidden in print) */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Cetak &amp; Bagikan Berkas Struk</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold font-mono">
              {transaction.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
            title="Tutup Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary PDF Actions Bar (Hidden in print) */}
        <div className="p-3 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-b border-rose-100 flex flex-wrap items-center justify-between gap-2 print:hidden">
          {/* Main Requested Actions: PDF Download & PDF Share */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Bagikan Berkas PDF (Web Share API with actual File object) */}
            <button
              onClick={handleSharePdfFile}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
              title="Bagikan berkas PDF langsung ke WhatsApp / Medsos tanpa link"
            >
              <Share2 className="w-4 h-4 text-emerald-200" />
              <span>Bagikan File PDF (WhatsApp/Medsos)</span>
            </button>

            {/* Unduh Berkas PDF (.pdf) */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
              title="Unduh berkas dokumen PDF (.pdf) ke memori HP / Laptop"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Direct WhatsApp text link */}
            <button
              onClick={handleShareWhatsAppChat}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
              title="Kirim Ringkasan Teks ke WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {/* Copy Text Button */}
            <button
              onClick={handleCopyText}
              className={`p-2 rounded-xl text-xs font-medium border transition-colors ${
                copied
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
              title="Salin Teks Struk"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Standard Print / PDF Dialog */}
            <button
              onClick={handlePrint}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
              title="Buka Dialog Cetak Printer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Feedback Alert if shared or downloaded */}
        {shareFeedback && (
          <div className="px-4 py-2.5 bg-emerald-50 text-emerald-900 border-b border-emerald-200 text-xs font-medium flex items-center justify-between print:hidden">
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shareFeedback}</span>
            </div>
            <button onClick={() => setShareFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Printable Invoice Container */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-white" id="printable-invoice">
          {/* Clinic Brand Header */}
          <div className="text-center border-b pb-4 border-slate-200">
            <div className="inline-block p-1 px-3 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest border border-rose-200 mb-1">
              AESTHETIC &amp; DERMATOLOGY CLINIC
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              RCA SKINCARE
            </h2>
            <p className="text-xs font-bold text-rose-600 mt-0.5">
              {branchInfo.name}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {branchInfo.address} • Telp/WA: {branchInfo.phone}
            </p>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">No. Invoice / Transaksi</span>
                <span className="font-bold text-slate-900 text-sm">{transaction.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tanggal &amp; Waktu</span>
                <span className="font-medium text-slate-700">{transaction.timestamp} WIB</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dokter / Penanggung Jawab</span>
                <span className="font-semibold text-slate-800">{transaction.attendingDoctor}</span>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nama Pasien</span>
                <span className="font-bold text-slate-900 text-sm">{transaction.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">No. Rekam Medis (RM)</span>
                <span className="font-bold text-rose-600">{transaction.medicalRecordNo}</span>
              </div>
              {transaction.patientPhone && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">No. WhatsApp Pasien</span>
                  <span className="font-medium text-slate-700">{transaction.patientPhone}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Metode &amp; Status Bayar</span>
                <span className="font-semibold text-emerald-700">
                  {transaction.paymentMethod} • {transaction.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Item / Tindakan</th>
                  <th className="py-2.5 px-3 text-center w-12">Qty</th>
                  <th className="py-2.5 px-3 text-right">Harga</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaction.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {item.nama}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                      {item.qty}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatRp(item.hargaSatuan)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatRp(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation */}
          <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatRp(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Diskon Promo Klinik:</span>
                <span>-{formatRp(transaction.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900 text-sm">TOTAL DIBAYAR:</span>
              <span className="font-black text-rose-600 text-lg">{formatRp(transaction.total)}</span>
            </div>
          </div>

          {/* Doctor instructions / notes */}
          {transaction.notes && (
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs">
              <span className="font-bold text-rose-900 block mb-0.5">Anjuran &amp; Catatan Dokter:</span>
              <p className="text-rose-800 italic">{transaction.notes}</p>
            </div>
          )}

          {/* Footer Thank you note */}
          <div className="text-center pt-4 border-t border-dashed border-slate-200 text-slate-500 text-[11px] space-y-1">
            <p className="font-semibold text-slate-800">
              Terima kasih telah mempercayakan perawatan kulit Anda pada RCA Skincare.
            </p>
            <p className="text-[10px]">
              Simpan struk ini untuk rujukan konsultasi dokter berikutnya. Layanan Hotline &amp; Reservasi: {branchInfo.phone}.
            </p>
          </div>
        </div>

        {/* Bottom Mobile Friendly Actions Footer (Hidden in print) */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 print:hidden">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Dokumen PDF otomatis terlampir utuh saat dibagikan ke WhatsApp / Medsos</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSharePdfFile}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan PDF</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
