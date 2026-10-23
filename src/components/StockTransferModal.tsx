import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  X,
  Building2,
  Package,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { StockItem, BranchId, StockTransferRecord } from '../types/clinic';
import { BRANCHES } from '../data/initialData';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: StockItem | null;
  targetBranchDefault?: BranchId;
  stockItems: StockItem[];
  onApplyTransfer: (record: StockTransferRecord) => void;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  targetBranchDefault,
  stockItems,
  onApplyTransfer,
}) => {
  const [itemId, setItemId] = useState<string>('');
  const [fromBranch, setFromBranch] = useState<BranchId>('springhill');
  const [toBranch, setToBranch] = useState<BranchId>('pangkalan-balai');
  const [qty, setQty] = useState<number>(5);
  const [officerName, setOfficerName] = useState<string>('Logistik Farmasi RCA');
  const [notes, setNotes] = useState<string>('Penyetaraan stok kritis cabang.');

  useEffect(() => {
    if (selectedItem) {
      setItemId(selectedItem.id);
      if (targetBranchDefault) {
        setToBranch(targetBranchDefault);
        // Find best source branch with highest stock
        const otherBranches = BRANCHES.filter((b) => b.id !== targetBranchDefault);
        const bestSource = otherBranches.sort(
          (a, b) => selectedItem.jumlah[b.id] - selectedItem.jumlah[a.id]
        )[0];
        if (bestSource) setFromBranch(bestSource.id);
      }
    } else if (stockItems.length > 0 && !itemId) {
      setItemId(stockItems[0].id);
    }
  }, [selectedItem, targetBranchDefault, stockItems]);

  if (!isOpen) return null;

  const currentItem = stockItems.find((i) => i.id === itemId);
  const sourceStock = currentItem ? currentItem.jumlah[fromBranch] ?? 0 : 0;
  const targetStock = currentItem ? currentItem.jumlah[toBranch] ?? 0 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;

    if (fromBranch === toBranch) {
      alert('Cabang asal dan tujuan tidak boleh sama.');
      return;
    }

    if (qty <= 0) {
      alert('Jumlah transfer harus lebih dari 0.');
      return;
    }

    if (qty > sourceStock) {
      alert(`Stok di cabang asal (${sourceStock}) tidak mencukupi untuk mentransfer ${qty} ${currentItem.satuan}.`);
      return;
    }

    const record: StockTransferRecord = {
      id: `TRF-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID'),
      fromBranch,
      toBranch,
      itemId: currentItem.id,
      itemNama: currentItem.nama,
      qty,
      officerName,
      notes,
    };

    onApplyTransfer(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Transfer Stok Antar Cabang</h3>
              <p className="text-xs text-slate-300">
                Penyetaraan stok obat/skincare Springhill, Sudirman, dan Pangkalan Balai
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
          {/* Product */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Produk yang Ditransfer
            </label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            >
              {stockItems.map((itm) => (
                <option key={itm.id} value={itm.id}>
                  {itm.nama} (Total: {itm.jumlah.total} {itm.satuan})
                </option>
              ))}
            </select>
          </div>

          {/* Source and Destination Branch */}
          <div className="grid grid-cols-2 gap-3">
            {/* From */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Cabang Pengirim (Asal)
              </label>
              <select
                value={fromBranch}
                onChange={(e) => setFromBranch(e.target.value as BranchId)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name.replace('RCA Skincare ', '')}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[11px] text-slate-500">
                Stok saat ini:{' '}
                <span className="font-bold text-slate-800">
                  {sourceStock} {currentItem?.satuan}
                </span>
              </div>
            </div>

            {/* To */}
            <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-2xl">
              <label className="block text-[11px] font-bold text-rose-800 mb-1">
                Cabang Penerima (Tujuan)
              </label>
              <select
                value={toBranch}
                onChange={(e) => setToBranch(e.target.value as BranchId)}
                className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name.replace('RCA Skincare ', '')}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[11px] text-slate-500">
                Stok saat ini:{' '}
                <span
                  className={`font-bold ${
                    targetStock <= 10 ? 'text-rose-600' : 'text-slate-800'
                  }`}
                >
                  {targetStock} {currentItem?.satuan}
                </span>
              </div>
            </div>
          </div>

          {/* Qty Transfer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jumlah yang Ditransfer ({currentItem?.satuan || 'pcs'})
            </label>
            <input
              type="number"
              min="1"
              max={sourceStock}
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              required
            />
            {qty > sourceStock && (
              <p className="text-[11px] text-rose-600 mt-1">
                Jumlah melebihi stok yang tersedia di cabang asal ({sourceStock}).
              </p>
            )}
          </div>

          {/* Officer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Petugas Ekspedisi / Logistik
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pengiriman
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Dikirim via kurir internal klinik, estimasi tiba sore ini."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
            />
          </div>

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
              disabled={qty > sourceStock || qty <= 0 || fromBranch === toBranch}
              className="px-5 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Kirim & Mutasikan Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
