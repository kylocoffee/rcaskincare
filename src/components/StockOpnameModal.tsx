import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  User,
  HelpCircle,
} from 'lucide-react';
import { StockItem, BranchId, StockOpnameRecord } from '../types/clinic';
import { BRANCHES } from '../data/initialData';

interface StockOpnameModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: StockItem | null;
  stockItems: StockItem[];
  onApplyOpname: (record: StockOpnameRecord) => void;
}

export const StockOpnameModal: React.FC<StockOpnameModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  stockItems,
  onApplyOpname,
}) => {
  const [itemId, setItemId] = useState<string>('');
  const [branch, setBranch] = useState<BranchId>('springhill');
  const [officerName, setOfficerName] = useState<string>('Apoteker Farah, S.Farm');
  const [stokFisik, setStokFisik] = useState<number>(0);
  const [kategoriSelisih, setKategoriSelisih] = useState<
    'Sesuai' | 'Barang Rusak' | 'Tester Treatment' | 'Selisih Kasir' | 'Kadaluarsa' | 'Lainnya'
  >('Sesuai');
  const [catatan, setCatatan] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setItemId(selectedItem.id);
      setStokFisik(selectedItem.jumlah[branch] ?? 0);
    } else if (stockItems.length > 0 && !itemId) {
      setItemId(stockItems[0].id);
      setStokFisik(stockItems[0].jumlah[branch] ?? 0);
    }
  }, [selectedItem, stockItems, branch]);

  if (!isOpen) return null;

  const currentItem = stockItems.find((i) => i.id === itemId);
  const stokSistem = currentItem ? currentItem.jumlah[branch] ?? 0 : 0;
  const selisih = stokFisik - stokSistem;

  const handleBranchChange = (newBranch: BranchId) => {
    setBranch(newBranch);
    if (currentItem) {
      setStokFisik(currentItem.jumlah[newBranch] ?? 0);
    }
  };

  const handleItemChange = (newItemId: string) => {
    setItemId(newItemId);
    const itm = stockItems.find((i) => i.id === newItemId);
    if (itm) {
      setStokFisik(itm.jumlah[branch] ?? 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;

    if (selisih !== 0 && !confirmDialog) {
      setConfirmDialog(true);
      return;
    }

    const record: StockOpnameRecord = {
      id: `OPN-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      branch,
      officerName,
      itemId: currentItem.id,
      itemNama: currentItem.nama,
      stokSistem,
      stokFisik,
      selisih,
      kategoriSelisih: selisih === 0 ? 'Sesuai' : kategoriSelisih,
      catatan: catatan || (selisih === 0 ? 'Hasil hitung fisik cocok dengan sistem.' : 'Penyesuaian stok opname.'),
    };

    onApplyOpname(record);
    setConfirmDialog(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Rekonsiliasi Stock Opname Fisik</h3>
              <p className="text-xs text-blue-100">
                Pencocokan stok riil gudang dengan data sistem klinik
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Branch Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cabang Klinik yang Diperiksa
            </label>
            <select
              value={branch}
              onChange={(e) => handleBranchChange(e.target.value as BranchId)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>

          {/* Product Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Obat / Produk Skincare
            </label>
            <select
              value={itemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {stockItems.map((itm) => (
                <option key={itm.id} value={itm.id}>
                  {itm.nama} ({itm.merkProduk} - {itm.satuan})
                </option>
              ))}
            </select>
          </div>

          {/* Comparison Cards: System vs Physical */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* System Stock */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Stok Menurut Sistem
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {stokSistem}{' '}
                <span className="text-xs font-normal text-slate-500">
                  {currentItem?.satuan || 'pcs'}
                </span>
              </span>
            </div>

            {/* Physical Stock Input */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl text-center">
              <label className="text-[11px] font-bold text-blue-900 block mb-1">
                Hitungan Fisik Nyata
              </label>
              <input
                type="number"
                min="0"
                value={stokFisik}
                onChange={(e) => setStokFisik(parseInt(e.target.value, 10) || 0)}
                className="w-24 text-center mx-auto text-xl font-black text-blue-900 bg-white border border-blue-300 rounded-xl py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Discrepancy Indicator */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              selisih === 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : selisih < 0
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span>Selisih Hitung (Varian):</span>
            <span className="font-black text-sm">
              {selisih > 0 ? `+${selisih}` : selisih} {currentItem?.satuan || 'pcs'}
              {selisih === 0 && ' (Sesuai)'}
            </span>
          </div>

          {/* If discrepancy exists, require reason category */}
          {selisih !== 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Alasan Selisih
              </label>
              <select
                value={kategoriSelisih}
                onChange={(e) => setKategoriSelisih(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="Barang Rusak">Barang Rusak / Kemasan Pecah</option>
                <option value="Tester Treatment">Dipakai untuk Tester / Tindakan Pasien</option>
                <option value="Kadaluarsa">Kadaluarsa / Rusak Formula</option>
                <option value="Selisih Kasir">Selisih Input Transaksi Kasir</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          )}

          {/* Petugas Opname */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Petugas / Apoteker Penanggung Jawab
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Opname
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Ditemukan 1 botol pecah di ruang tindakan treatment."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            ></textarea>
          </div>

          {/* Confirm Dialog warning if mutating stock */}
          {confirmDialog && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Konfirmasi Penyesuaian Stok
              </p>
              <p>
                Stok <strong>{currentItem?.nama}</strong> di cabang{' '}
                <strong>{BRANCHES.find((b) => b.id === branch)?.name}</strong> akan diubah dari{' '}
                <strong>{stokSistem}</strong> menjadi <strong>{stokFisik}</strong>. Lanjutkan?
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              {confirmDialog ? 'Ya, Terapkan Hasil Opname' : 'Simpan & Update Stok'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
