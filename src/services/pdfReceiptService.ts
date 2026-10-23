import { jsPDF } from 'jspdf';
import { Transaction, BranchInfo } from '../types/clinic';

/**
 * Service to generate authentic, high-quality PDF receipts in the browser
 * Works 100% offline and on all mobile devices without window.print() dependency.
 * Returns Blob, File (for navigator.share({ files: [pdfFile] })), and data URL.
 */

export interface GeneratedPdfResult {
  doc: jsPDF;
  blob: Blob;
  file: File;
  fileName: string;
}

export function generateInvoicePdf(
  transaction: Transaction,
  branchInfo: BranchInfo
): GeneratedPdfResult {
  // A5 format: 148 mm x 210 mm (universal clinic invoice standard)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  let y = margin;

  // Header background decorative pill
  doc.setFillColor(254, 242, 242); // Rose-50
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(225, 29, 72); // Rose-600
  doc.text('RCA SKINCARE', pageWidth / 2, y + 7, { align: 'center' });

  // Clinic Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('AESTHETIC & DERMATOLOGY CLINIC', pageWidth / 2, y + 11.5, { align: 'center' });

  // Branch & Contact
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(branchInfo.name.toUpperCase(), pageWidth / 2, y + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(`${branchInfo.address} • Telp/WA: ${branchInfo.phone}`, pageWidth / 2, y + 20.5, { align: 'center' });

  y += 28;

  // Invoice & Patient Meta Grid (2 columns)
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  const col1X = margin + 4;
  const col2X = margin + contentWidth / 2 + 2;

  // Col 1: Invoice Details
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('NO. INVOICE:', col1X, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(transaction.id, col1X + 26, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('TANGGAL:', col1X, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`${transaction.timestamp} WIB`, col1X + 26, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('DOKTER PIC:', col1X, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(transaction.attendingDoctor, col1X + 26, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('PEMBAYARAN:', col1X, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // Emerald-600
  doc.text(`${transaction.paymentMethod} (${transaction.paymentStatus})`, col1X + 26, y + 20);

  // Col 2: Patient Info
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('PASIEN:', col2X, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(transaction.patientName, col2X + 22, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('NO. RM:', col2X, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72); // Rose-600
  doc.text(transaction.medicalRecordNo, col2X + 22, y + 10);

  if (transaction.patientPhone) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text('NO. WA:', col2X, y + 15);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(transaction.patientPhone, col2X + 22, y + 15);
  }

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('KATEGORI:', col2X, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(transaction.category, col2X + 22, y + 20);

  y += 30;

  // Table Header
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.line(margin, y + 7, margin + contentWidth, y + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85); // Slate-700
  doc.text('ITEM / TINDAKAN', margin + 3, y + 4.8);
  doc.text('QTY', margin + contentWidth - 55, y + 4.8, { align: 'center' });
  doc.text('HARGA', margin + contentWidth - 32, y + 4.8, { align: 'right' });
  doc.text('SUBTOTAL', margin + contentWidth - 3, y + 4.8, { align: 'right' });

  y += 7;

  // Table Body Items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  transaction.items.forEach((item, index) => {
    // Zebra row background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 7, 'F');
    }

    doc.setTextColor(15, 23, 42);
    // Truncate name if too long
    const cleanName = item.nama.length > 34 ? item.nama.slice(0, 32) + '...' : item.nama;
    doc.text(cleanName, margin + 3, y + 4.8);

    doc.setTextColor(71, 85, 105);
    doc.text(`${item.qty}`, margin + contentWidth - 55, y + 4.8, { align: 'center' });
    doc.text(formatRp(item.hargaSatuan), margin + contentWidth - 32, y + 4.8, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatRp(item.subtotal), margin + contentWidth - 3, y + 4.8, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 7;
  });

  // Table Bottom line
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + contentWidth, y);
  y += 4;

  // Totals Area
  const totalBoxX = margin + contentWidth - 65;
  const totalBoxWidth = 65;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalBoxX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatRp(transaction.subtotal), margin + contentWidth - 3, y, { align: 'right' });

  if (transaction.discount > 0) {
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(225, 29, 72);
    doc.text('Diskon Promo:', totalBoxX, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`-${formatRp(transaction.discount)}`, margin + contentWidth - 3, y, { align: 'right' });
  }

  y += 6;
  // Grand Total Highlight Pill
  doc.setFillColor(225, 29, 72); // Rose-600
  doc.roundedRect(totalBoxX - 4, y - 4, totalBoxWidth + 4, 9, 2, 2, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL DIBAYAR:', totalBoxX, y + 2.2);
  doc.setFontSize(10);
  doc.text(formatRp(transaction.total), margin + contentWidth - 3, y + 2.2, { align: 'right' });

  y += 12;

  // Doctor Advice / Notes Box (if any)
  if (transaction.notes) {
    doc.setFillColor(255, 241, 242); // Rose-50
    doc.setDrawColor(254, 205, 211); // Rose-200
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(159, 18, 57); // Rose-900
    doc.text('ANJURAN & CATATAN DOKTER:', margin + 3, y + 4.5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(190, 24, 93); // Rose-800
    const cleanNotes = transaction.notes.length > 70 ? transaction.notes.slice(0, 68) + '...' : transaction.notes;
    doc.text(cleanNotes, margin + 3, y + 9.5);

    y += 18;
  }

  // Footer / Thank You Note
  y = Math.max(y, pageHeight - 25);
  doc.setDrawColor(226, 232, 240);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(margin, y, margin + contentWidth, y);
  doc.setLineDashPattern([], 0); // reset dash

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(
    'Terima kasih telah mempercayakan perawatan kulit Anda pada RCA Skincare.',
    pageWidth / 2,
    y + 5,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Simpan struk PDF ini untuk rujukan konsultasi dokter berikutnya • Layanan Hotline: ${branchInfo.phone}`,
    pageWidth / 2,
    y + 9,
    { align: 'center' }
  );

  const cleanPatient = transaction.patientName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Struk-${transaction.id}-${cleanPatient}.pdf`;

  const blob = doc.output('blob');
  const file = new File([blob], fileName, { type: 'application/pdf' });

  return { doc, blob, file, fileName };
}
