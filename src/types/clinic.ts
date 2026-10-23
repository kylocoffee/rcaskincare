/**
 * RCA Skincare - Multi-Branch Clinic ERP Types
 * Cabang: Springhill, Sudirman, Pangkalan Balai
 */

export type BranchId = 'springhill' | 'sudirman' | 'pangkalan-balai';
export type FilterBranchId = BranchId | 'all';

export interface BranchInfo {
  id: BranchId;
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  headDoctor: string;
  accentColor: string;
}

export interface StockQuantity {
  springhill: number;
  sudirman: number;
  'pangkalan-balai': number;
  total: number;
}

export interface StockItem {
  no: number;
  id: string;
  nama: string;
  jenis: string; // Serum, Krim Pagi, Krim Malam, Toner, Facial Wash, Sunscreen, Ampul Injeksi, Peeling Solution, Salep Antibiotik, Masker, dll.
  merkProduk: string; // RCA Skincare Premium, RCA Derma Care, RCA Acne Clear, dll.
  jumlah: StockQuantity;
  hargaModal: number; // Rupiah
  hargaJual: number;  // Rupiah
  satuan: string;     // Botol, Tube, Vial, Box, Pcs, Pot
  keterangan: string; // Exp Date, Batch No, Suhu Penyimpanan, Rekomendasi
  minStockThreshold: number; // Default 10
  sku: string;
  terakhirOpname?: string;
}

export interface TransactionItem {
  itemId: string;
  nama: string;
  qty: number;
  hargaSatuan: number;
  subtotal: number;
  isSkincareProduct: boolean;
}

export type PaymentMethod = 'QRIS' | 'Tunai' | 'Transfer BCA' | 'Transfer Mandiri' | 'Debit/Kredit';
export type TransactionCategory = 'Treatment' | 'Resep Obat & Skincare' | 'Paket Bundling' | 'Konsultasi Dokter';

export interface Transaction {
  id: string;
  branch: BranchId;
  timestamp: string;
  patientName: string;
  patientPhone: string;
  medicalRecordNo: string;
  attendingDoctor: string;
  category: TransactionCategory;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Lunas' | 'Pending';
  notes?: string;
}

export interface StockOpnameRecord {
  id: string;
  date: string;
  branch: BranchId;
  officerName: string;
  itemId: string;
  itemNama: string;
  stokSistem: number;
  stokFisik: number;
  selisih: number; // fisik - sistem
  kategoriSelisih: 'Sesuai' | 'Barang Rusak' | 'Tester Treatment' | 'Selisih Kasir' | 'Kadaluarsa' | 'Lainnya';
  catatan: string;
}

export interface StockTransferRecord {
  id: string;
  timestamp: string;
  fromBranch: BranchId;
  toBranch: BranchId;
  itemId: string;
  itemNama: string;
  qty: number;
  officerName: string;
  notes: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  autoSync: boolean;
}

export type ExpenseCategory =
  | 'Gaji & Honor Dokter/Terapis'
  | 'Operasional & Utilitas'
  | 'Pembelian Suplier & Bahan'
  | 'Sewa Tempat'
  | 'Pemasaran & Iklan'
  | 'Maintenance Alat Medis/Laser'
  | 'Lain-lain';

export interface Expense {
  id: string;
  branch: BranchId;
  date: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  paidTo: string;
  paymentMethod: 'Kas Tunai' | 'Transfer BCA' | 'Transfer Mandiri' | 'Lainnya';
  receiptNumber?: string;
  notes?: string;
  recordedBy: string;
}

export interface MasterDataConfig {
  productTypes: string[];
  productBrands: string[];
  defaultMinStockThreshold: number;
}

export interface ClinicBackupData {
  version: string;
  exportedAt: string;
  clinicName: string;
  stockItems: StockItem[];
  transactions: Transaction[];
  expenses: Expense[];
  productTypes: string[];
  productBrands: string[];
}

export type TimeFilterPeriod = 'today' | 'yesterday' | 'daily_range' | '7_weeks' | 'monthly' | 'all';

export interface TimeFilterConfig {
  period: TimeFilterPeriod;
  startDate: string;
  endDate: string;
  selectedMonth: string;
}

export interface StockMovement {
  id: string;
  date: string;
  branch: BranchId;
  type: 'IN' | 'OUT' | 'TRANSFER';
  itemId: string;
  itemNama: string;
  qty: number;
  reason: string;
  referenceId?: string;
}
