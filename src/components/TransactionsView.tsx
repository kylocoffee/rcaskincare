import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Download,
  Plus,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  User,
  CreditCard,
  Building2,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Package,
  Layers,
} from 'lucide-react';
import {
  Transaction,
  Expense,
  StockItem,
  FilterBranchId,
  TimeFilterConfig,
  TimeFilterPeriod,
} from '../types/clinic';
import { BRANCHES } from '../data/initialData';
import { TimeFilterBar } from './TimeFilterBar';

interface TransactionsViewProps {
  transactions: Transaction[];
  expenses?: Expense[];
  stockItems?: StockItem[];
  selectedBranch: FilterBranchId;
  setSelectedBranch: (b: FilterBranchId) => void;
  onOpenNewTransaction: () => void;
  onOpenEditTransaction: (trx: Transaction) => void;
  onDeleteTransaction: (trx: Transaction) => void;
  onOpenInvoice: (trx: Transaction) => void;
  onExportExcel: () => void;
  onOpenMonthlyReset?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  expenses = [],
  stockItems = [],
  selectedBranch,
  setSelectedBranch,
  onOpenNewTransaction,
  onOpenEditTransaction,
  onDeleteTransaction,
  onOpenInvoice,
  onExportExcel,
  onOpenMonthlyReset,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'pemasukan' | 'pengeluaran' | 'mutasi_stok'>('pemasukan');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Time Filter State
  const [timeFilter, setTimeFilter] = useState<TimeFilterConfig>(() => {
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    return {
      period: 'all',
      startDate: today,
      endDate: today,
      selectedMonth: month,
    };
  });

  // Date Checker Utility
  const matchDateFilter = (isoDateOrTimestamp: string): boolean => {
    if (timeFilter.period === 'all') return true;
    const dateStr = isoDateOrTimestamp.substring(0, 10); // YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    if (timeFilter.period === 'today') {
      return dateStr === today;
    }

    if (timeFilter.period === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return dateStr === y.toISOString().split('T')[0];
    }

    if (timeFilter.period === 'daily_range') {
      return dateStr >= timeFilter.startDate && dateStr <= timeFilter.endDate;
    }

    if (timeFilter.period === '7_weeks') {
      const past7Weeks = new Date();
      past7Weeks.setDate(past7Weeks.getDate() - 49);
      const minDate = past7Weeks.toISOString().split('T')[0];
      return dateStr >= minDate && dateStr <= today;
    }

    if (timeFilter.period === 'monthly') {
      return dateStr.startsWith(timeFilter.selectedMonth);
    }

    return true;
  };

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    if (selectedBranch !== 'all' && t.branch !== selectedBranch) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;
    if (!matchDateFilter(t.timestamp)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        t.patientName.toLowerCase().includes(q) ||
        t.medicalRecordNo.toLowerCase().includes(q) ||
        t.attendingDoctor.toLowerCase().includes(q) ||
        t.items.some((i) => i.nama.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    if (selectedBranch !== 'all' && e.branch !== selectedBranch) return false;
    if (!matchDateFilter(e.date)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.paidTo.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Stock Out Count from filtered transactions
  const stokKeluarQty = filteredTransactions.reduce((acc, t) => {
    return (
      acc +
      t.items.reduce((iAcc, item) => (item.isSkincareProduct ? iAcc + item.qty : iAcc), 0)
    );
  }, 0);

  // Stock In calculation (from opname physical adjustments or transfers)
  const totalPemasukan = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalPengeluaran = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const arusKasBersih = totalPemasukan - totalPengeluaran;

  const formatRp = (num: number) => 'Rp ' + num.toLocaleString('id-ID');

  // Detect distinct months across transactions & expenses
  const allMonths = Array.from(
    new Set([
      ...transactions.map((t) => t.timestamp.substring(0, 7)),
      ...expenses.map((e) => e.date.substring(0, 7)),
    ])
  ).sort().reverse();

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Pusat Transaksi & Arus Kas Klinik
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {filteredTransactions.length} Pemasukan • {filteredExpenses.length} Beban
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Filter mutasi transaksi hari ke hari, per 7 minggu, atau per bulan dengan sinkronisasi Google Sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenMonthlyReset && (
            <button
              onClick={onOpenMonthlyReset}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              title="Reset Transaksi Per Bulan (Password Protected)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Per Bulan</span>
            </button>
          )}

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Integrated Time Filter Bar */}
      <TimeFilterBar
        filterConfig={timeFilter}
        onFilterChange={setTimeFilter}
        availableMonths={allMonths}
        metrics={{
          totalPemasukan,
          totalPengeluaran,
          arusKasBersih,
          stokKeluarQty,
          stokMasukQty: 0,
          trxCount: filteredTransactions.length,
        }}
      />

      {/* View Switcher Tabs (Pemasukan vs Pengeluaran vs Mutasi Stok) */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveViewTab('pemasukan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeViewTab === 'pemasukan'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          <span>Pemasukan Penjualan ({filteredTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveViewTab('pengeluaran')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeViewTab === 'pengeluaran'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-rose-600" />
          <span>Pengeluaran Kas ({filteredExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveViewTab('mutasi_stok')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeViewTab === 'mutasi_stok'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-purple-600" />
          <span>Mutasi Stok Obat ({stokKeluarQty} Item Terjual)</span>
        </button>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeViewTab === 'pemasukan'
                ? 'Cari nama pasien, No RM, No Invoice, dokter, atau obat...'
                : activeViewTab === 'pengeluaran'
                ? 'Cari keperluan, penerima kas, atau kategori biaya...'
                : 'Cari riwayat pemakaian produk...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value as FilterBranchId)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">Semua Cabang (Springhill, Sudirman, PB)</option>
            <option value="springhill">Cabang Springhill</option>
            <option value="sudirman">Cabang Sudirman</option>
            <option value="pangkalan-balai">Cabang Pangkalan Balai</option>
          </select>

          {activeViewTab === 'pemasukan' && (
            <>
              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="all">Semua Kategori</option>
                <option value="Treatment">Treatment Medis</option>
                <option value="Resep Obat & Skincare">Resep Obat & Skincare</option>
                <option value="Paket Bundling">Paket Bundling</option>
                <option value="Konsultasi Dokter">Konsultasi Dokter</option>
              </select>

              {/* Payment filter */}
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="all">Semua Metode Pembayaran</option>
                <option value="QRIS">QRIS</option>
                <option value="Transfer BCA">Transfer BCA</option>
                <option value="Transfer Mandiri">Transfer Mandiri</option>
                <option value="Tunai">Tunai / Cash</option>
                <option value="Debit/Kredit">Debit / Kartu Kredit</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* VIEW 1: TRANSAKSI PENJUALAN (PEMASUKAN) */}
      {activeViewTab === 'pemasukan' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">No Invoice & Waktu</th>
                  <th className="py-3.5 px-3">Cabang</th>
                  <th className="py-3.5 px-4">Pasien & No RM</th>
                  <th className="py-3.5 px-3">Kategori</th>
                  <th className="py-3.5 px-4">Rincian Tindakan / Obat</th>
                  <th className="py-3.5 px-3">Pembayaran</th>
                  <th className="py-3.5 px-4 text-right">Total Bayar</th>
                  <th className="py-3.5 px-3 text-center">Invoice & CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Tidak ditemukan data transaksi pada periode filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx) => {
                    const branchInfo = BRANCHES.find((b) => b.id === trx.branch);

                    return (
                      <tr key={trx.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Invoice & Time */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{trx.id}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{trx.timestamp}</span>
                          </div>
                        </td>

                        {/* Cabang */}
                        <td className="py-3 px-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: branchInfo?.accentColor || '#64748b' }}
                          >
                            {branchInfo?.name.replace('RCA Skincare ', '')}
                          </span>
                        </td>

                        {/* Pasien & RM */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{trx.patientName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            RM: <span className="font-semibold text-slate-600">{trx.medicalRecordNo}</span> • {trx.patientPhone}
                          </div>
                        </td>

                        {/* Kategori */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                            {trx.category}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {trx.attendingDoctor.split(',')[0]}
                          </div>
                        </td>

                        {/* Items */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="space-y-0.5">
                            {trx.items.map((i, idx) => (
                              <div key={idx} className="text-[11px] text-slate-700 flex items-center justify-between gap-2">
                                <span className="truncate">{i.nama}</span>
                                <span className="font-semibold text-slate-500 whitespace-nowrap">x{i.qty}</span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Metode Bayar */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800 text-xs">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            <span>{trx.paymentMethod}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {trx.paymentStatus}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-slate-900 text-sm">
                            {formatRp(trx.total)}
                          </div>
                          {trx.discount > 0 && (
                            <div className="text-[10px] text-rose-600 font-medium">
                              Hemat: {formatRp(trx.discount)}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onOpenInvoice(trx)}
                              title="Lihat / Cetak Struk Invoice"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenEditTransaction(trx)}
                              title="Edit Rincian Transaksi"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(trx)}
                              title="Hapus Transaksi (Opsi Reversal Stok)"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
            <div>
              Total <span className="font-bold text-slate-900">{filteredTransactions.length}</span> transaksi terfilter.
            </div>
            <div className="text-sm">
              Total Omzet Sesuai Filter:{' '}
              <span className="font-black text-emerald-600 text-base ml-1">
                {formatRp(totalPemasukan)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PENGELUARAN KAS */}
      {activeViewTab === 'pengeluaran' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Tanggal & ID</th>
                  <th className="py-3.5 px-3">Cabang</th>
                  <th className="py-3.5 px-4">Kategori Biaya</th>
                  <th className="py-3.5 px-4">Deskripsi Keperluan</th>
                  <th className="py-3.5 px-3">Dibayar Kepada</th>
                  <th className="py-3.5 px-3">Metode Bayar</th>
                  <th className="py-3.5 px-4 text-right">Nominal Beban</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada catatan pengeluaran pada rentang waktu ini.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => {
                    const branchInfo = BRANCHES.find((b) => b.id === exp.branch);
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{exp.date}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{exp.id}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: branchInfo?.accentColor || '#64748b' }}
                          >
                            {branchInfo?.name.replace('RCA Skincare ', '')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {exp.title}
                          {exp.notes && (
                            <span className="block text-[10px] text-slate-400 font-normal italic">
                              {exp.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{exp.paidTo}</td>
                        <td className="py-3 px-3 text-slate-500">{exp.paymentMethod}</td>
                        <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                          {formatRp(exp.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
            <div>
              Total <span className="font-bold text-slate-900">{filteredExpenses.length}</span> pos beban kas operasional.
            </div>
            <div className="text-sm">
              Total Pengeluaran Kas:{' '}
              <span className="font-black text-rose-600 text-base ml-1">
                {formatRp(totalPengeluaran)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MUTASI STOK OBAT & SKINCARE KELUAR */}
      {activeViewTab === 'mutasi_stok' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Rekapitulasi Mutasi Stok Obat & Produk Terjual
              </h3>
              <p className="text-xs text-slate-500">
                Dihitung langsung dari transaksi yang diproses di kasir pada periode ini
              </p>
            </div>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold">
              Total {stokKeluarQty} pcs produk keluar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Waktu Transaksi</th>
                  <th className="py-3.5 px-3">Cabang</th>
                  <th className="py-3.5 px-4">Pasien</th>
                  <th className="py-3.5 px-4">Nama Produk / Obat</th>
                  <th className="py-3.5 px-3 text-center">Mutasi Keluar</th>
                  <th className="py-3.5 px-4 text-right">Harga Satuan</th>
                  <th className="py-3.5 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransactions.flatMap((trx) =>
                  trx.items
                    .filter((item) => item.isSkincareProduct)
                    .map((item, idx) => {
                      const branchInfo = BRANCHES.find((b) => b.id === trx.branch);
                      return (
                        <tr key={`${trx.id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4 text-slate-500">{trx.timestamp}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                              style={{ backgroundColor: branchInfo?.accentColor || '#64748b' }}
                            >
                              {branchInfo?.name.replace('RCA Skincare ', '')}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{trx.patientName}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">{item.nama}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-black text-xs">
                              -{item.qty}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right text-slate-600">{formatRp(item.hargaSatuan)}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatRp(item.subtotal)}</td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
