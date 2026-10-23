import * as XLSX from 'xlsx';
import { StockItem, Transaction, FilterBranchId } from '../types/clinic';

/**
 * Service to generate styled, professional Excel (.xlsx) reports for RCA Skincare
 */

export function exportStockOpnameToExcel(
  items: StockItem[],
  selectedBranch: FilterBranchId = 'all',
  customTitle?: string
) {
  const branchLabel =
    selectedBranch === 'springhill'
      ? 'Cabang Springhill'
      : selectedBranch === 'sudirman'
      ? 'Cabang Sudirman'
      : selectedBranch === 'pangkalan-balai'
      ? 'Cabang Pangkalan Balai'
      : 'Konsolidasi Semua Cabang (Springhill, Sudirman, Pangkalan Balai)';

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Prepare table rows adhering strictly to the user's required format:
  // No, Nama, Jenis, Merk Produk, Jumlah, Harga Modal & Jual, Keterangan
  const dataRows = items.map((item, index) => {
    let stockQty = item.jumlah.total;
    if (selectedBranch === 'springhill') stockQty = item.jumlah.springhill;
    else if (selectedBranch === 'sudirman') stockQty = item.jumlah.sudirman;
    else if (selectedBranch === 'pangkalan-balai') stockQty = item.jumlah['pangkalan-balai'];

    const totalModal = stockQty * item.hargaModal;
    const totalJual = stockQty * item.hargaJual;
    const potensiMargin = totalJual - totalModal;

    return {
      'No': index + 1,
      'Nama Produk / Obat': item.nama,
      'Jenis': item.jenis,
      'Merk Produk': item.merkProduk,
      'Satuan': item.satuan,
      'Jumlah Stok Springhill': item.jumlah.springhill,
      'Jumlah Stok Sudirman': item.jumlah.sudirman,
      'Jumlah Stok Pangkalan Balai': item.jumlah['pangkalan-balai'],
      'Jumlah Stok Terpilih': stockQty,
      'Harga Modal (Rp)': item.hargaModal,
      'Harga Jual (Rp)': item.hargaJual,
      'Total Nilai Modal (Rp)': totalModal,
      'Total Potensi Omzet (Rp)': totalJual,
      'Potensi Laba (Rp)': potensiMargin,
      'Status Stok':
        stockQty === 0
          ? 'HABIS'
          : stockQty <= item.minStockThreshold
          ? 'MENIPIS'
          : 'AMAN',
      'Keterangan': item.keterangan,
    };
  });

  // Calculate totals
  const totalQty = dataRows.reduce((acc, row) => acc + row['Jumlah Stok Terpilih'], 0);
  const totalNilaiModal = dataRows.reduce((acc, row) => acc + row['Total Nilai Modal (Rp)'], 0);
  const totalPotensiOmzet = dataRows.reduce((acc, row) => acc + row['Total Potensi Omzet (Rp)'], 0);
  const totalLaba = totalPotensiOmzet - totalNilaiModal;

  // Add Summary row
  dataRows.push({
    'No': '' as any,
    'Nama Produk / Obat': 'TOTAL KESELURUHAN',
    'Jenis': '',
    'Merk Produk': '',
    'Satuan': '',
    'Jumlah Stok Springhill': items.reduce((acc, i) => acc + i.jumlah.springhill, 0),
    'Jumlah Stok Sudirman': items.reduce((acc, i) => acc + i.jumlah.sudirman, 0),
    'Jumlah Stok Pangkalan Balai': items.reduce((acc, i) => acc + i.jumlah['pangkalan-balai'], 0),
    'Jumlah Stok Terpilih': totalQty,
    'Harga Modal (Rp)': 0,
    'Harga Jual (Rp)': 0,
    'Total Nilai Modal (Rp)': totalNilaiModal,
    'Total Potensi Omzet (Rp)': totalPotensiOmzet,
    'Potensi Laba (Rp)': totalLaba,
    'Status Stok': '',
    'Keterangan': `Rekapitulasi tanggal ${currentDate}`,
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 38 }, // Nama
    { wch: 18 }, // Jenis
    { wch: 24 }, // Merk Produk
    { wch: 8 },  // Satuan
    { wch: 12 }, // Springhill
    { wch: 12 }, // Sudirman
    { wch: 14 }, // Pangkalan Balai
    { wch: 12 }, // Terpilih
    { wch: 16 }, // Modal
    { wch: 16 }, // Jual
    { wch: 18 }, // Total Modal
    { wch: 18 }, // Total Jual
    { wch: 16 }, // Laba
    { wch: 12 }, // Status
    { wch: 45 }, // Keterangan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Opname');

  // File name
  const safeDate = new Date().toISOString().split('T')[0];
  const branchSlug = selectedBranch.toUpperCase();
  const filename = `RCA_Skincare_Stock_Opname_${branchSlug}_${safeDate}.xlsx`;

  XLSX.writeFile(workbook, filename);
  return filename;
}

export function exportTransactionsToExcel(
  transactions: Transaction[],
  selectedBranch: FilterBranchId = 'all'
) {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const filtered = selectedBranch === 'all'
    ? transactions
    : transactions.filter((t) => t.branch === selectedBranch);

  const dataRows: Record<string, any>[] = filtered.map((t, idx) => {
    const branchName =
      t.branch === 'springhill'
        ? 'Springhill'
        : t.branch === 'sudirman'
        ? 'Sudirman'
        : 'Pangkalan Balai';

    return {
      'No': idx + 1,
      'No Invoice': t.id,
      'Tanggal & Waktu': t.timestamp,
      'Cabang': branchName,
      'Nama Pasien': t.patientName,
      'No RM': t.medicalRecordNo,
      'No WhatsApp': t.patientPhone,
      'Kategori': t.category,
      'Dokter / Terapis': t.attendingDoctor,
      'Rincian Item': t.items.map((i) => `${i.nama} (${i.qty}x)`).join('; '),
      'Subtotal (Rp)': t.subtotal,
      'Diskon (Rp)': t.discount,
      'Total Bayar (Rp)': t.total,
      'Metode Pembayaran': t.paymentMethod,
      'Status': t.paymentStatus,
      'Catatan': t.notes || '-',
    };
  });

  const totalOmzet = filtered.reduce((acc, t) => acc + t.total, 0);

  // Summary Row
  dataRows.push({
    'No': '',
    'No Invoice': 'TOTAL OMZET',
    'Tanggal & Waktu': '',
    'Cabang': '',
    'Nama Pasien': '',
    'No RM': '',
    'No WhatsApp': '',
    'Kategori': '-',
    'Dokter / Terapis': '',
    'Rincian Item': `${filtered.length} Transaksi`,
    'Subtotal (Rp)': filtered.reduce((acc, t) => acc + t.subtotal, 0),
    'Diskon (Rp)': filtered.reduce((acc, t) => acc + t.discount, 0),
    'Total Bayar (Rp)': totalOmzet,
    'Metode Pembayaran': '-',
    'Status': 'Rekapitulasi',
    'Catatan': `Rekapitulasi transaksi tanggal ${currentDate}`,
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 26 },
    { wch: 35 },
    { wch: 15 },
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
    { wch: 10 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Transaksi');

  const safeDate = new Date().toISOString().split('T')[0];
  const filename = `RCA_Skincare_Rekap_Transaksi_${selectedBranch.toUpperCase()}_${safeDate}.xlsx`;

  XLSX.writeFile(workbook, filename);
  return filename;
}
