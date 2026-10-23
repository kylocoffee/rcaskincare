import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Info,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StockItem, FilterBranchId, BranchId } from '../types/clinic';
import { BRANCHES } from '../data/initialData';

interface StockOpnameViewProps {
  stockItems: StockItem[];
  selectedBranch: FilterBranchId;
  setSelectedBranch: (b: FilterBranchId) => void;
  onOpenAddProduct: () => void;
  onOpenEditProduct: (item: StockItem) => void;
  onDeleteProduct: (item: StockItem) => void;
  onOpenStockOpnameForm: (item?: StockItem) => void;
  onOpenTransferStock: (item?: StockItem) => void;
  onExportExcel: () => void;
}

export const StockOpnameView: React.FC<StockOpnameViewProps> = ({
  stockItems,
  selectedBranch,
  setSelectedBranch,
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onOpenStockOpnameForm,
  onOpenTransferStock,
  onExportExcel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Extract unique categories
  const categories = Array.from(new Set(stockItems.map((i) => i.jenis)));

  // Filter items
  const filteredItems = stockItems.filter((item) => {
    // Search query match
    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.merkProduk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jenis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keterangan.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category match
    if (selectedCategory !== 'all' && item.jenis !== selectedCategory) {
      return false;
    }

    // Low stock filter match
    if (filterLowStockOnly) {
      if (selectedBranch === 'all') {
        const isAnyLow =
          item.jumlah.springhill <= item.minStockThreshold ||
          item.jumlah.sudirman <= item.minStockThreshold ||
          item.jumlah['pangkalan-balai'] <= item.minStockThreshold;
        if (!isAnyLow) return false;
      } else {
        const branchQty =
          selectedBranch === 'springhill'
            ? item.jumlah.springhill
            : selectedBranch === 'sudirman'
            ? item.jumlah.sudirman
            : item.jumlah['pangkalan-balai'];
        if (branchQty > item.minStockThreshold) return false;
      }
    }

    return true;
  });

  const formatRp = (num: number) => 'Rp ' + num.toLocaleString('id-ID');

  return (
    <div className="space-y-5 pb-12">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Format Master Stock Opname & Inventaris Obat
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              {filteredItems.length} dari {stockItems.length} Produk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Format Standar: <span className="font-semibold text-slate-700">No • Nama • Jenis • Merk Produk • Jumlah • Harga Modal & Jual • Keterangan</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel Button */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          {/* Form Opname Fisik Button */}
          <button
            onClick={() => onOpenStockOpnameForm()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rekonsiliasi Opname Fisik</span>
          </button>

          {/* Transfer Stock Button */}
          <button
            onClick={() => onOpenTransferStock()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Antar Cabang</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama obat, merk produk (RCA Skincare), jenis, atau batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter dropdown */}
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

          {/* Category Filter dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">Semua Jenis Produk</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle button */}
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              filterLowStockOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${filterLowStockOnly ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>Hanya Stok Menipis (&le;10)</span>
          </button>
        </div>
      </div>

      {/* Main Stock Opname Table adhering strictly to the user's required format:
          No, Nama, Jenis, Merk Produk, Jumlah, Harga Modal & Jual, Keterangan */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-3 text-center w-12">No</th>
                <th className="py-3.5 px-4">Nama Produk & Obat</th>
                <th className="py-3.5 px-3">Jenis</th>
                <th className="py-3.5 px-3">Merk Produk</th>
                <th className="py-3.5 px-4 text-center">
                  Jumlah Stok
                  <span className="block text-[10px] font-normal text-slate-400 lowercase">
                    (springhill / sudirman / p.balai)
                  </span>
                </th>
                <th className="py-3.5 px-4 text-right">Harga Modal & Jual</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-3 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data produk/obat dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const isSpringhillLow = item.jumlah.springhill <= item.minStockThreshold;
                  const isSudirmanLow = item.jumlah.sudirman <= item.minStockThreshold;
                  const isPBLow = item.jumlah['pangkalan-balai'] <= item.minStockThreshold;
                  const isAnyLow = isSpringhillLow || isSudirmanLow || isPBLow;

                  // Highlighting selected branch count
                  let activeQty = item.jumlah.total;
                  if (selectedBranch === 'springhill') activeQty = item.jumlah.springhill;
                  else if (selectedBranch === 'sudirman') activeQty = item.jumlah.sudirman;
                  else if (selectedBranch === 'pangkalan-balai') activeQty = item.jumlah['pangkalan-balai'];

                  const marginPct =
                    item.hargaJual > 0
                      ? Math.round(((item.hargaJual - item.hargaModal) / item.hargaJual) * 100)
                      : 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isAnyLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* 1. No */}
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {index + 1}
                      </td>

                      {/* 2. Nama */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {item.nama}
                          {isAnyLow && (
                            <span
                              title="Stok menipis di salah satu cabang"
                              className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block"
                            ></span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>SKU: {item.sku}</span>
                          <span>•</span>
                          <span>Kemasan: {item.satuan}</span>
                        </div>
                      </td>

                      {/* 3. Jenis */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {item.jenis}
                        </span>
                      </td>

                      {/* 4. Merk Produk */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-rose-900 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-100 text-[11px]">
                          {item.merkProduk}
                        </span>
                      </td>

                      {/* 5. Jumlah (Multi-Branch Details) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              isSpringhillLow ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-800'
                            }`}
                            title="Springhill"
                          >
                            SH: {item.jumlah.springhill}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              isSudirmanLow ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-800'
                            }`}
                            title="Sudirman"
                          >
                            SD: {item.jumlah.sudirman}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              isPBLow ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-800'
                            }`}
                            title="Pangkalan Balai"
                          >
                            PB: {item.jumlah['pangkalan-balai']}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          Total Gabungan:{' '}
                          <span className="font-black text-slate-900 text-xs">
                            {item.jumlah.total} {item.satuan}
                          </span>
                        </div>
                      </td>

                      {/* 6. Harga Modal & Jual */}
                      <td className="py-3 px-4 text-right">
                        <div className="text-slate-500 text-[11px]">
                          Modal: <span className="font-medium text-slate-700">{formatRp(item.hargaModal)}</span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs mt-0.5">
                          Jual: {formatRp(item.hargaJual)}
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                          Margin: {marginPct}%
                        </span>
                      </td>

                      {/* 7. Keterangan */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-[11px] text-slate-600 line-clamp-2" title={item.keterangan}>
                          {item.keterangan}
                        </p>
                        {item.terakhirOpname && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Opname terakhir: {item.terakhirOpname}
                          </span>
                        )}
                      </td>

                      {/* 8. Aksi Cepat */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEditProduct(item)}
                            title="Edit Data Produk / Stok"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenStockOpnameForm(item)}
                            title="Opname Fisik vs Sistem"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenTransferStock(item)}
                            title="Transfer Antar Cabang"
                            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(item)}
                            title="Hapus Produk dari Master"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
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

        {/* Table Footer with Summary Asset */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div>
            Menampilkan <span className="font-bold text-slate-900">{filteredItems.length}</span> produk dalam sistem master.
          </div>
          <div className="flex items-center gap-4">
            <span>
              Total Aset Modal:{' '}
              <span className="font-bold text-slate-900">
                {formatRp(
                  filteredItems.reduce((acc, i) => acc + i.jumlah.total * i.hargaModal, 0)
                )}
              </span>
            </span>
            <span>
              Potensi Omzet:{' '}
              <span className="font-bold text-rose-600">
                {formatRp(
                  filteredItems.reduce((acc, i) => acc + i.jumlah.total * i.hargaJual, 0)
                )}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
