import React from 'react';
import {
  AlertTriangle,
  X,
  ArrowRightLeft,
  Package,
  Building2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { StockItem, BranchId } from '../types/clinic';
import { BRANCHES } from '../data/initialData';

interface LowStockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItems: StockItem[];
  onOpenTransfer: (item: StockItem, targetBranch?: BranchId) => void;
}

export const LowStockAlertModal: React.FC<LowStockAlertModalProps> = ({
  isOpen,
  onClose,
  stockItems,
  onOpenTransfer,
}) => {
  if (!isOpen) return null;

  // Flatten low stock alerts per branch
  const alerts: Array<{
    item: StockItem;
    branchId: BranchId;
    qty: number;
    threshold: number;
    severity: 'critical' | 'low';
  }> = [];

  stockItems.forEach((item) => {
    BRANCHES.forEach((b) => {
      const branchQty = item.jumlah[b.id] ?? 0;
      if (branchQty <= item.minStockThreshold) {
        alerts.push({
          item,
          branchId: b.id,
          qty: branchQty,
          threshold: item.minStockThreshold,
          severity: branchQty <= 5 ? 'critical' : 'low',
        });
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-rose-100">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Pusat Notifikasi Stok Obat Menipis</h3>
              <p className="text-xs text-rose-100">
                Deteksi otomatis persediaan kritis di 3 cabang klinik RCA Skincare
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800">Semua Stok Obat & Skincare Aman!</p>
              <p className="text-xs text-slate-400">
                Tidak ada produk di bawah ambang batas minimal stok di cabang Springhill, Sudirman, maupun Pangkalan Balai.
              </p>
            </div>
          ) : (
            alerts.map((alert, idx) => {
              const branchInfo = BRANCHES.find((b) => b.id === alert.branchId);

              // Find candidate branch with highest surplus for transfer
              const otherBranches = BRANCHES.filter((b) => b.id !== alert.branchId);
              const bestSourceBranch = otherBranches.sort(
                (a, b) => alert.item.jumlah[b.id] - alert.item.jumlah[a.id]
              )[0];

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-200'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          alert.severity === 'critical'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {alert.severity === 'critical' ? '🔴 KRITIS' : '🟡 MENIPIS'}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {alert.item.nama}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {branchInfo?.name.replace('RCA Skincare ', '')}:
                      </span>
                      <span className="font-black text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                        Sisa {alert.qty} {alert.item.satuan}
                      </span>
                      <span className="text-slate-400">
                        (Batas Min: {alert.threshold})
                      </span>
                    </div>

                    {bestSourceBranch && (
                      <p className="text-[11px] text-slate-500">
                        Rekomendasi:{' '}
                        <span className="font-semibold text-emerald-700">
                          {bestSourceBranch.name.replace('RCA Skincare ', '')} memiliki{' '}
                          {alert.item.jumlah[bestSourceBranch.id]} {alert.item.satuan} surplus.
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTransfer(alert.item, alert.branchId);
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Transfer ke Cabang Ini</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Ambang batas peringatan default: &le;10 pcs</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
