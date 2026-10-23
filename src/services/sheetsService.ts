import { StockItem, Transaction, Expense, BranchInfo, BranchId } from '../types/clinic';
import { BRANCHES } from '../data/initialData';

/**
 * Service to interact directly with Google Sheets API v4 using client-side OAuth Bearer token
 * Creates 5 structured tabs:
 * 1. Ringkasan_Klinik_RCA (Executive Overview)
 * 2. Stock_Opname_RCA (Standard Pharmacy Opname)
 * 3. Pemasukan_Transaksi_RCA (Sales & Invoices)
 * 4. Pengeluaran_Beban_RCA (Expenses & Operating Costs)
 * 5. Profil_Cabang_RCA (Branch & PIC Doctor Data)
 * 
 * Strict Constraint: All business data is stored in Google Spreadsheet (NO localStorage).
 */

export interface CreateSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export interface FetchedClinicData {
  stockItems?: StockItem[];
  transactions?: Transaction[];
  expenses?: Expense[];
  branches?: BranchInfo[];
}

/**
 * Create a new formatted Google Spreadsheet with 5 organized RCA Skincare tabs
 */
export async function createRcaSpreadsheet(
  accessToken: string,
  title: string = 'RCA Skincare - Database Terpadu 3 Cabang (Stok, Pemasukan & Pengeluaran)'
): Promise<CreateSpreadsheetResult> {
  const requestBody = {
    properties: {
      title,
      locale: 'id_ID',
      timeZone: 'Asia/Jakarta',
    },
    sheets: [
      {
        properties: {
          title: 'Ringkasan_Klinik_RCA',
          gridProperties: { frozenRowCount: 1, rowCount: 100, columnCount: 10 },
        },
      },
      {
        properties: {
          title: 'Stock_Opname_RCA',
          gridProperties: { frozenRowCount: 1, rowCount: 300, columnCount: 16 },
        },
      },
      {
        properties: {
          title: 'Pemasukan_Transaksi_RCA',
          gridProperties: { frozenRowCount: 1, rowCount: 1000, columnCount: 16 },
        },
      },
      {
        properties: {
          title: 'Pengeluaran_Beban_RCA',
          gridProperties: { frozenRowCount: 1, rowCount: 500, columnCount: 12 },
        },
      },
      {
        properties: {
          title: 'Profil_Cabang_RCA',
          gridProperties: { frozenRowCount: 1, rowCount: 50, columnCount: 8 },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal membuat Google Spreadsheet (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl =
    data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Helper to clear and write a sheet tab cleanly
 * Prevents ghost/zombie rows when records are deleted or reset.
 */
async function clearAndWriteSheetTab(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  values: any[][]
) {
  // Clear previous range before writing to eliminate old lingering rows
  try {
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      `${sheetName}!A1:Z2000`
    )}:clear`;
    await fetch(clearUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.warn(`Clear range warning for ${sheetName}:`, err);
  }

  // Write sanitized rows
  const range = `${sheetName}!A1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const fallbackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`;
    await fetch(fallbackUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });
  }
}

/**
 * Helper to get values from a sheet tab range
 */
async function getSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][] | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.values || null;
}

/**
 * Synchronize all 5 tabs with executive formatting into Google Spreadsheet
 */
export async function syncFullClinicDataToSheets(
  accessToken: string,
  spreadsheetId: string,
  {
    stockItems,
    transactions,
    expenses,
    branches,
  }: {
    stockItems: StockItem[];
    transactions: Transaction[];
    expenses: Expense[];
    branches?: BranchInfo[];
  }
): Promise<{ updatedTabs: number }> {
  const now = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const branchList = branches && branches.length > 0 ? branches : BRANCHES;

  // 1. Tab: Ringkasan_Klinik_RCA
  const totalOmzet = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalPengeluaran = expenses.reduce((acc, e) => acc + e.amount, 0);

  // HPP of sold products
  const totalHPP = transactions.reduce((acc, t) => {
    return (
      acc +
      t.items.reduce((iAcc, item) => {
        const s = stockItems.find((stk) => stk.id === item.itemId);
        return iAcc + (s ? s.hargaModal : item.hargaSatuan * 0.5) * item.qty;
      }, 0)
    );
  }, 0);

  const labaKotor = totalOmzet - totalHPP;
  const labaBersih = labaKotor - totalPengeluaran;

  const totalAsetModal = stockItems.reduce((acc, i) => acc + i.jumlah.total * i.hargaModal, 0);
  const totalPotensiOmzet = stockItems.reduce((acc, i) => acc + i.jumlah.total * i.hargaJual, 0);

  const ringkasanRows = [
    ['RINGKASAN EKSEKUTIF KINERJA KLINIK RCA SKINCARE (CLOUD DATABASE)', '', '', '', ''],
    [`Terakhir Disinkronkan: ${now} WIB`, '', '', '', ''],
    ['Penyimpanan: Google Spreadsheet Cloud Realtime (Strictly No LocalStorage)', '', '', '', ''],
    ['', '', '', '', ''],
    ['INDIKATOR KEUANGAN KONSOLIDASI', 'NILAI (RUPIAH)', 'KETERANGAN', '', ''],
    ['Total Omzet Penjualan (Pemasukan)', totalOmzet, `${transactions.length} transaksi pasien tercatat`],
    ['Total HPP / Modal Obat Terjual', totalHPP, 'Harga pokok penjualan dari produk farmasi'],
    ['Laba Kotor (Gross Profit)', labaKotor, 'Omzet dikurangi HPP'],
    ['Total Pengeluaran Operasional (Kas Keluar)', totalPengeluaran, `${expenses.length} pos beban operasional/gaji`],
    ['Laba Bersih Riil (Net Profit)', labaBersih, 'Laba kotor dikurangi beban operasional'],
    ['', '', '', '', ''],
    ['ASET PERSEDIAAN OBAT & SKINCARE', 'NILAI (RUPIAH)', 'KETERANGAN', '', ''],
    ['Total Nilai Modal Persediaan (Aset)', totalAsetModal, `${stockItems.length} jenis produk/obat di master`],
    ['Total Potensi Omzet Penjualan Stok', totalPotensiOmzet, 'Potensi omzet jika seluruh stok habis terjual'],
    ['Potensi Margin Laba Stok', totalPotensiOmzet - totalAsetModal, 'Estimasi keuntungan dari stok saat ini'],
    ['', '', '', '', ''],
    ['PERBANDINGAN KINERJA ANTAR CABANG', 'TOTAL OMZET (RP)', 'TRANSAKSI', 'PENGELUARAN (RP)', 'LABA BERSIH (RP)'],
    ...branchList.map((b) => {
      const bTrx = transactions.filter((t) => t.branch === b.id);
      const bExp = expenses.filter((e) => e.branch === b.id);
      const bOmzet = bTrx.reduce((acc, t) => acc + t.total, 0);
      const bHPP = bTrx.reduce(
        (acc, t) =>
          acc +
          t.items.reduce((iAcc, item) => {
            const s = stockItems.find((stk) => stk.id === item.itemId);
            return iAcc + (s ? s.hargaModal : item.hargaSatuan * 0.5) * item.qty;
          }, 0),
        0
      );
      const bBiaya = bExp.reduce((acc, e) => acc + e.amount, 0);
      const bLaba = bOmzet - bHPP - bBiaya;
      return [b.name, bOmzet, bTrx.length, bBiaya, bLaba];
    }),
  ];

  // 2. Tab: Stock_Opname_RCA
  const stockHeaders = [
    'No',
    'SKU',
    'Nama Produk / Obat',
    'Jenis',
    'Merk Produk',
    'Satuan',
    'Stok Springhill',
    'Stok Sudirman',
    'Stok Pangkalan Balai',
    'Total Stok Fisik',
    'Harga Modal (Rp)',
    'Harga Jual (Rp)',
    'Total Nilai Modal (Rp)',
    'Total Potensi Omzet (Rp)',
    'Status Stok',
    'Keterangan & Batch',
  ];

  const stockRows = stockItems.map((item, index) => {
    const isSpringhillLow = item.jumlah.springhill <= item.minStockThreshold;
    const isSudirmanLow = item.jumlah.sudirman <= item.minStockThreshold;
    const isPBLow = item.jumlah['pangkalan-balai'] <= item.minStockThreshold;
    const isAnyLow = isSpringhillLow || isSudirmanLow || isPBLow;

    const statusStok =
      item.jumlah.total === 0
        ? 'HABIS'
        : isAnyLow
        ? 'MENIPIS DI CABANG'
        : 'AMAN';

    return [
      index + 1,
      item.sku,
      item.nama,
      item.jenis,
      item.merkProduk,
      item.satuan,
      item.jumlah.springhill,
      item.jumlah.sudirman,
      item.jumlah['pangkalan-balai'],
      item.jumlah.total,
      item.hargaModal,
      item.hargaJual,
      item.jumlah.total * item.hargaModal,
      item.jumlah.total * item.hargaJual,
      statusStok,
      item.keterangan,
    ];
  });

  // 3. Tab: Pemasukan_Transaksi_RCA
  const trxHeaders = [
    'No Invoice',
    'Tanggal & Waktu',
    'Cabang',
    'Nama Pasien',
    'No Rekam Medis (RM)',
    'No WhatsApp / HP',
    'Dokter / Penanggung Jawab',
    'Kategori',
    'Rincian Item / Obat',
    'Subtotal (Rp)',
    'Diskon (Rp)',
    'Total Bayar (Rp)',
    'Metode Pembayaran',
    'Status Pembayaran',
    'Catatan Khusus',
    'Item JSON Raw',
  ];

  const trxRows = transactions.map((t) => {
    const branchName =
      t.branch === 'springhill'
        ? 'Springhill'
        : t.branch === 'sudirman'
        ? 'Sudirman'
        : 'Pangkalan Balai';

    return [
      t.id,
      t.timestamp,
      branchName,
      t.patientName,
      t.medicalRecordNo,
      t.patientPhone,
      t.attendingDoctor,
      t.category,
      t.items.map((i) => `${i.nama} (${i.qty}x)`).join(', '),
      t.subtotal,
      t.discount,
      t.total,
      t.paymentMethod,
      t.paymentStatus,
      t.notes || '-',
      JSON.stringify(t.items),
    ];
  });

  // 4. Tab: Pengeluaran_Beban_RCA
  const expHeaders = [
    'ID Pengeluaran',
    'Tanggal',
    'Cabang',
    'Kategori Beban',
    'Nama Pengeluaran / Keperluan',
    'Nominal Beban (Rp)',
    'Dibayarkan Kepada',
    'Metode Bayar',
    'No. Bukti / Nota',
    'Dicatat Oleh',
    'Catatan Tambahan',
  ];

  const expRows = expenses.map((e) => {
    const branchName =
      e.branch === 'springhill'
        ? 'Springhill'
        : e.branch === 'sudirman'
        ? 'Sudirman'
        : 'Pangkalan Balai';

    return [
      e.id,
      e.date,
      branchName,
      e.category,
      e.title,
      e.amount,
      e.paidTo,
      e.paymentMethod,
      e.receiptNumber || '-',
      e.recordedBy,
      e.notes || '-',
    ];
  });

  // 5. Tab: Profil_Cabang_RCA
  const branchHeaders = [
    'ID Cabang',
    'Nama Cabang',
    'Dokter Penanggung Jawab',
    'Kota',
    'No Telepon / WhatsApp',
    'Alamat Lengkap',
    'Tagline Cabang',
    'Warna Aksen',
  ];

  const branchRows = branchList.map((b) => [
    b.id,
    b.name,
    b.headDoctor,
    b.city,
    b.phone,
    b.address,
    b.tagline,
    b.accentColor,
  ]);

  // Execute updates cleanly with pre-clear to prevent stale/ghost rows on deletes or edits
  await clearAndWriteSheetTab(accessToken, spreadsheetId, 'Ringkasan_Klinik_RCA', ringkasanRows);
  await clearAndWriteSheetTab(accessToken, spreadsheetId, 'Stock_Opname_RCA', [stockHeaders, ...stockRows]);
  await clearAndWriteSheetTab(accessToken, spreadsheetId, 'Pemasukan_Transaksi_RCA', [trxHeaders, ...trxRows]);
  await clearAndWriteSheetTab(accessToken, spreadsheetId, 'Pengeluaran_Beban_RCA', [expHeaders, ...expRows]);
  try {
    await clearAndWriteSheetTab(accessToken, spreadsheetId, 'Profil_Cabang_RCA', [branchHeaders, ...branchRows]);
  } catch (e) {
    console.warn('Tab Profil_Cabang_RCA skipped if not exist:', e);
  }

  return { updatedTabs: 5 };
}

/**
 * Fetch and parse all clinic database records from Google Spreadsheet
 * Acts as the remote database reader so the application doesn't rely on localStorage.
 */
export async function fetchClinicDataFromSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<FetchedClinicData> {
  const result: FetchedClinicData = {};

  try {
    // 1. Fetch Stock Master from Stock_Opname_RCA
    const stockData = await getSheetRange(accessToken, spreadsheetId, 'Stock_Opname_RCA!A2:P300');
    if (stockData && stockData.length > 0) {
      const parsedStock: StockItem[] = stockData
        .filter((row) => row[1] && row[2]) // must have SKU and Name
        .map((row, idx) => {
          const sku = String(row[1] || `SKU-${idx + 1}`);
          const nama = String(row[2] || '');
          const jenis = String(row[3] || 'Cream Wajah');
          const merkProduk = String(row[4] || 'RCA Skincare Premium');
          const satuan = String(row[5] || 'Pot');
          const sh = Number(row[6]) || 0;
          const sd = Number(row[7]) || 0;
          const pb = Number(row[8]) || 0;
          const total = Number(row[9]) || sh + sd + pb;
          const hargaModal = Number(row[10]) || 0;
          const hargaJual = Number(row[11]) || 0;
          const keterangan = String(row[15] || '');

          return {
            no: idx + 1,
            id: `stk-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            sku,
            nama,
            jenis,
            merkProduk,
            satuan,
            jumlah: {
              springhill: sh,
              sudirman: sd,
              'pangkalan-balai': pb,
              total,
            },
            minStockThreshold: 5,
            hargaModal,
            hargaJual,
            terakhirOpname: new Date().toISOString().split('T')[0],
            keterangan,
          };
        });

      if (parsedStock.length > 0) {
        result.stockItems = parsedStock;
      }
    }

    // 2. Fetch Transactions from Pemasukan_Transaksi_RCA
    const trxData = await getSheetRange(accessToken, spreadsheetId, 'Pemasukan_Transaksi_RCA!A2:P1000');
    if (trxData && trxData.length > 0) {
      const parsedTrx: Transaction[] = trxData
        .filter((row) => row[0] && row[1]) // must have Invoice ID and Date
        .map((row) => {
          const id = String(row[0]);
          const timestamp = String(row[1]);
          const branchRaw = String(row[2] || '').toLowerCase();
          const branch: BranchId = branchRaw.includes('sudirman')
            ? 'sudirman'
            : branchRaw.includes('pangkalan')
            ? 'pangkalan-balai'
            : 'springhill';
          const patientName = String(row[3] || '');
          const medicalRecordNo = String(row[4] || '');
          const patientPhone = String(row[5] || '');
          const attendingDoctor = String(row[6] || 'dr. Rina Cahyani, Sp.DVE');
          const category = (row[7] as any) || 'Resep Obat & Skincare';
          const subtotal = Number(row[9]) || 0;
          const discount = Number(row[10]) || 0;
          const total = Number(row[11]) || 0;
          const paymentMethod = (row[12] as any) || 'QRIS';
          const rawStatus = String(row[13] || '').toLowerCase();
          const paymentStatus = rawStatus.includes('pending') ? 'Pending' : 'Lunas';
          const notes = String(row[14] || '');

          // Parse raw JSON if available, otherwise construct from items text
          let items: any[] = [];
          if (row[15] && String(row[15]).startsWith('[')) {
            try {
              items = JSON.parse(String(row[15]));
            } catch {
              items = [];
            }
          }

          if (items.length === 0) {
            const itemText = String(row[8] || 'Produk / Tindakan Medis');
            items = [
              {
                itemId: 'custom-item',
                nama: itemText,
                satuan: 'Paket',
                hargaSatuan: total,
                qty: 1,
                subtotal: total,
                isSkincareProduct: true,
              },
            ];
          }

          return {
            id,
            timestamp,
            branch,
            patientName,
            medicalRecordNo,
            patientPhone,
            attendingDoctor,
            category,
            items,
            subtotal: subtotal || total,
            discount,
            tax: 0,
            total,
            paymentMethod,
            paymentStatus,
            notes,
          };
        });

      if (parsedTrx.length > 0) {
        result.transactions = parsedTrx;
      }
    }

    // 3. Fetch Expenses from Pengeluaran_Beban_RCA
    const expData = await getSheetRange(accessToken, spreadsheetId, 'Pengeluaran_Beban_RCA!A2:K500');
    if (expData && expData.length > 0) {
      const parsedExpenses: Expense[] = expData
        .filter((row) => row[0] && row[4]) // must have ID and Title
        .map((row) => {
          const id = String(row[0]);
          const date = String(row[1]);
          const branchRaw = String(row[2] || '').toLowerCase();
          const branch: BranchId = branchRaw.includes('sudirman')
            ? 'sudirman'
            : branchRaw.includes('pangkalan')
            ? 'pangkalan-balai'
            : 'springhill';
          const category = (row[3] as any) || 'Operasional';
          const title = String(row[4]);
          const amount = Number(row[5]) || 0;
          const paidTo = String(row[6] || '');
          const paymentMethod = (row[7] as any) || 'Transfer Bank';
          const receiptNumber = String(row[8] || '');
          const recordedBy = String(row[9] || 'Admin');
          const notes = String(row[10] || '');

          return {
            id,
            date,
            branch,
            category,
            title,
            amount,
            paidTo,
            paymentMethod,
            receiptNumber,
            recordedBy,
            notes,
          };
        });

      if (parsedExpenses.length > 0) {
        result.expenses = parsedExpenses;
      }
    }

    // 4. Fetch Branch Profiles from Profil_Cabang_RCA
    const branchData = await getSheetRange(accessToken, spreadsheetId, 'Profil_Cabang_RCA!A2:H50');
    if (branchData && branchData.length > 0) {
      const parsedBranches: BranchInfo[] = branchData
        .filter((row) => row[0] && row[1])
        .map((row) => {
          const id = row[0] as BranchId;
          const name = String(row[1]);
          const headDoctor = String(row[2]);
          const city = String(row[3] || 'Palembang');
          const phone = String(row[4]);
          const address = String(row[5]);
          const tagline = String(row[6] || '');
          const accentColor = String(row[7] || '#f43f5e');

          return {
            id,
            name,
            headDoctor,
            city,
            phone,
            address,
            tagline,
            accentColor,
          };
        });

      if (parsedBranches.length > 0) {
        result.branches = parsedBranches;
      }
    }
  } catch (error) {
    console.error('Error fetching clinic data from Google Sheets:', error);
    throw error;
  }

  return result;
}
