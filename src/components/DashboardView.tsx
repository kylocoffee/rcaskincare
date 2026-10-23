import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Building2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react';
import { StockItem, Transaction, FilterBranchId, BranchId, BranchInfo } from '../types/clinic';
import { Edit2, Pencil } from 'lucide-react';

interface DashboardViewProps {
  selectedBranch: FilterBranchId;
  setSelectedBranch: (branch: FilterBranchId) => void;
  branches: BranchInfo[];
  stockItems: StockItem[];
  transactions: Transaction[];
  onOpenLowStock: () => void;
  onOpenNewTransaction: () => void;
  onOpenAiAdvisor: () => void;
  onExportExcel: () => void;
  onOpenEditBranch: (branch: BranchInfo) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedBranch,
  setSelectedBranch,
  branches,
  stockItems,
  transactions,
  onOpenLowStock,
  onOpenNewTransaction,
  onOpenAiAdvisor,
  onExportExcel,
  onOpenEditBranch,
}) => {
  // Filter transactions based on branch
  const filteredTransactions =
    selectedBranch === 'all'
      ? transactions
      : transactions.filter((t) => t.branch === selectedBranch);

  // Financial calculations
  const totalOmzet = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalTransactionsCount = filteredTransactions.length;
  const avgBasketSize = totalTransactionsCount > 0 ? Math.round(totalOmzet / totalTransactionsCount) : 0;

  // Stock Asset calculations
  const totalStockQty = stockItems.reduce((acc, item) => {
    if (selectedBranch === 'all') return acc + item.jumlah.total;
    if (selectedBranch === 'springhill') return acc + item.jumlah.springhill;
    if (selectedBranch === 'sudirman') return acc + item.jumlah.sudirman;
    return acc + item.jumlah['pangkalan-balai'];
  }, 0);

  const totalStockAssetModal = stockItems.reduce((acc, item) => {
    let qty = item.jumlah.total;
    if (selectedBranch === 'springhill') qty = item.jumlah.springhill;
    else if (selectedBranch === 'sudirman') qty = item.jumlah.sudirman;
    else if (selectedBranch === 'pangkalan-balai') qty = item.jumlah['pangkalan-balai'];
    return acc + qty * item.hargaModal;
  }, 0);

  const totalStockPotensiOmzet = stockItems.reduce((acc, item) => {
    let qty = item.jumlah.total;
    if (selectedBranch === 'springhill') qty = item.jumlah.springhill;
    else if (selectedBranch === 'sudirman') qty = item.jumlah.sudirman;
    else if (selectedBranch === 'pangkalan-balai') qty = item.jumlah['pangkalan-balai'];
    return acc + qty * item.hargaJual;
  }, 0);

  // Critical items check
  const lowStockItems = stockItems.filter((item) => {
    if (selectedBranch === 'all') {
      return (
        item.jumlah.springhill <= item.minStockThreshold ||
        item.jumlah.sudirman <= item.minStockThreshold ||
        item.jumlah['pangkalan-balai'] <= item.minStockThreshold
      );
    }
    const branchQty =
      selectedBranch === 'springhill'
        ? item.jumlah.springhill
        : selectedBranch === 'sudirman'
        ? item.jumlah.sudirman
        : item.jumlah['pangkalan-balai'];
    return branchQty <= item.minStockThreshold;
  });

  // Per branch performance stats
  const branchMetrics = branches.map((b) => {
    const bTrx = transactions.filter((t) => t.branch === b.id);
    const bOmzet = bTrx.reduce((acc, t) => acc + t.total, 0);
    const bStockCount = stockItems.reduce((acc, i) => acc + (i.jumlah[b.id] || 0), 0);
    const bLowStockCount = stockItems.filter((i) => (i.jumlah[b.id] || 0) <= i.minStockThreshold).length;

    return {
      branch: b,
      trxCount: bTrx.length,
      omzet: bOmzet,
      stockCount: bStockCount,
      lowStockCount: bLowStockCount,
    };
  });

  const totalAllOmzet = branchMetrics.reduce((acc, bm) => acc + bm.omzet, 0);

  // Top Products sold
  const productSalesMap: Record<string, { nama: string; qty: number; revenue: number }> = {};
  filteredTransactions.forEach((trx) => {
    trx.items.forEach((item) => {
      if (!productSalesMap[item.nama]) {
        productSalesMap[item.nama] = { nama: item.nama, qty: 0, revenue: 0 };
      }
      productSalesMap[item.nama].qty += item.qty;
      productSalesMap[item.nama].revenue += item.subtotal;
    });
  });
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Format currency helper
  const formatRp = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Alert Banner if any stock is low */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Peringatan Inventaris: {lowStockItems.length} Produk Mulai Menipis
              </h4>
              <p className="text-xs text-amber-700">
                Terdapat obat/skincare dengan stok di bawah batas minimal di cabang Springhill, Sudirman, atau Pangkalan Balai.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenLowStock}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Tinjau & Transfer Stok</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Omzet */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Omzet Penjualan
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatRp(totalOmzet)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {selectedBranch === 'all'
                  ? 'Gabungan 3 Cabang'
                  : branches.find((b) => b.id === selectedBranch)?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Transaksi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Volume Transaksi
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalTransactionsCount}{' '}
              <span className="text-sm font-normal text-slate-500">transaksi</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Rata-rata: <span className="font-semibold text-slate-800">{formatRp(avgBasketSize)}</span> / invoice
            </div>
          </div>
        </div>

        {/* Card 3: Nilai Aset Stok Modal */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nilai Aset Stok (Modal)
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatRp(totalStockAssetModal)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Total Fisik: <span className="font-semibold text-slate-800">{totalStockQty} pcs</span> obat & skincare
            </div>
          </div>
        </div>

        {/* Card 4: Potensi Omzet & Laba */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Potensi Omzet Inventaris
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatRp(totalStockPotensiOmzet)}
            </div>
            <div className="mt-1 text-xs text-purple-700 font-medium">
              Margin Estimasi: <span className="font-bold">{formatRp(totalStockPotensiOmzet - totalStockAssetModal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Branch Performance Comparison Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-600" />
              Perbandingan Kinerja Antar Cabang RCA Skincare
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemantauan real-time performa penjualan, ketersediaan stok, dan status resiko inventaris per cabang
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAiAdvisor}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analisis Komparasi AI</span>
            </button>
            <button
              onClick={onExportExcel}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Ekspor Rekap Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {branchMetrics.map(({ branch, trxCount, omzet, stockCount, lowStockCount }) => {
            const contributionPct = totalAllOmzet > 0 ? Math.round((omzet / totalAllOmzet) * 100) : 0;
            const isSelected = selectedBranch === branch.id;

            return (
              <div
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/20 shadow-md ring-2 ring-rose-100'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: branch.accentColor }}
                    ></span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {branch.name.replace('RCA Skincare ', '')}
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    {contributionPct}% Omzet
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1 italic">{branch.tagline}</p>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">Omzet Cabang:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatRp(omzet)}
                    </span>
                  </div>

                  {/* Visual Progress Bar for Contribution */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${contributionPct}%`,
                        backgroundColor: branch.accentColor,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs pt-2 border-t border-slate-200/60">
                    <span className="text-slate-500">Total Transaksi:</span>
                    <span className="font-semibold text-slate-800">{trxCount} invoice</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Stok Obat/Skincare:</span>
                    <span className="font-semibold text-slate-800">{stockCount} pcs</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Stok Menipis (&le;10):</span>
                    <span
                      className={`font-bold ${
                        lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {lowStockCount > 0 ? `${lowStockCount} item perlu restock` : 'Semua aman'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Penanggung Jawab:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditBranch(branch);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Klik untuk Mengubah Nama Penanggung Jawab"
                    >
                      <Edit2 className="w-3 h-3 text-rose-500" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditBranch(branch);
                    }}
                    className="font-medium text-slate-800 hover:text-rose-600 truncate max-w-[155px] text-left underline decoration-slate-300 underline-offset-2 transition-colors"
                    title={`Klik untuk ubah: ${branch.headDoctor}`}
                  >
                    {branch.headDoctor}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Grid: Top Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Treatment & Skincare Terlaris */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top Produk & Treatment Terlaris
            </h3>
            <span className="text-xs text-slate-500 font-medium">Berdasarkan Volume Terjual</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada data penjualan.</p>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{prod.nama}</p>
                      <p className="text-[11px] text-slate-500">{prod.qty} unit terjual</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {formatRp(prod.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Actions & Clinic Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Aksi Cepat Manajemen RCA Skincare
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <button
                onClick={onOpenNewTransaction}
                className="p-3 text-left rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors group"
              >
                <div className="text-xs font-bold text-rose-900 flex items-center justify-between">
                  <span>Kasir & Transaksi</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-rose-700 mt-1">
                  Catat resep obat atau tindakan klinik langsung potong stok.
                </p>
              </button>

              <button
                onClick={onOpenLowStock}
                className="p-3 text-left rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors group"
              >
                <div className="text-xs font-bold text-amber-900 flex items-center justify-between">
                  <span>Transfer Stok Cabang</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  Relokasi produk dari Springhill ke cabang lain yang menipis.
                </p>
              </button>

              <button
                onClick={onExportExcel}
                className="p-3 text-left rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors group"
              >
                <div className="text-xs font-bold text-emerald-900 flex items-center justify-between">
                  <span>Rekapitulasi Excel</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Unduh pembukuan bulanan format Stock Opname & Transaksi.
                </p>
              </button>

              <button
                onClick={onOpenAiAdvisor}
                className="p-3 text-left rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors group"
              >
                <div className="text-xs font-bold text-purple-900 flex items-center justify-between">
                  <span>Analisis AI Cerdas</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-purple-700 mt-1">
                  Prediksi restock & tren estetika dengan penalaran tinggi.
                </p>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sistem sinkronisasi terhubung ke Google Workspace</span>
            <span className="font-semibold text-slate-700">Versi ERP 2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
