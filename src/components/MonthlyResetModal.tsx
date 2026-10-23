import React, { useState } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  Lock,
  Calendar,
  CheckCircle2,
  X,
  HelpCircle,
} from 'lucide-react';
import { Transaction } from '../types/clinic';

interface MonthlyResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onConfirmResetMonth: (month: string, revertStock: boolean) => void;
  currentAdminPassword?: string;
}

export const MonthlyResetModal: React.FC<MonthlyResetModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onConfirmResetMonth,
  currentAdminPassword = 'rca2026',
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date().toISOString();
    return today.substring(0, 7); // 'YYYY-MM'
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [revertStock, setRevertStock] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Filter transactions matching this month
  const matchingTransactions = transactions.filter((t) =>
    t.timestamp.startsWith(selectedMonth)
  );

  const totalNominal = matchingTransactions.reduce((acc, t) => acc + t.total, 0);

  // Calculate items count that would be reverted
  const totalItemsCount = matchingTransactions.reduce((acc, t) => {
    return (
      acc +
      t.items.reduce((iAcc, item) => (item.isSkincareProduct ? iAcc + item.qty : iAcc), 0)
    );
  }, 0);

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  const getMonthLabel = (ym: string) => {
    const [year, month] = ym.split('-');
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${months[mIdx] || month} ${year}`;
  };

  // Distinct months in transactions
  const detectedMonths = Array.from(
    new Set(transactions.map((t) => t.timestamp.substring(0, 7)))
  ).sort().reverse();

  const handleExecute = () => {
    setErrorMessage('');
    if (passwordInput !== currentAdminPassword) {
      setErrorMessage('Password Admin salah! Silakan periksa kembali atau ganti di Pengaturan Admin.');
      return;
    }

    if (matchingTransactions.length === 0) {
      if (
        !confirm(
          `Tidak ada transaksi ditemukan pada bulan ${getMonthLabel(
            selectedMonth
          )}. Tetap lanjutkan operasi?`
        )
      ) {
        return;
      }
    }

    onConfirmResetMonth(selectedMonth, revertStock);
    onClose();
    setPasswordInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Reset Transaksi Per Bulan</h3>
              <p className="text-xs text-rose-100">
                Pembersihan transaksi berkala dengan otorisasi keamanan password admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Month Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              Pilih Periode Bulan yang Ingin Direset:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setErrorMessage('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            >
              {Array.from(
                new Set([
                  selectedMonth,
                  ...detectedMonths,
                  '2025-05',
                  '2025-04',
                  '2025-03',
                  '2025-02',
                  '2025-01',
                ])
              )
                .sort()
                .reverse()
                .map((m) => (
                  <option key={m} value={m}>
                    {getMonthLabel(m)} ({m})
                  </option>
                ))}
            </select>
          </div>

          {/* Impact Preview Card */}
          <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 text-xs">
                Dampak Reset untuk {getMonthLabel(selectedMonth)}:
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {matchingTransactions.length} Transaksi Terdeteksi
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-slate-800">
              <div className="bg-white p-2 rounded-xl border border-rose-100">
                <span className="text-[10px] text-slate-400 block font-medium">Total Nominal Terhapus:</span>
                <span className="font-black text-rose-600 text-sm">{formatRp(totalNominal)}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-rose-100">
                <span className="text-[10px] text-slate-400 block font-medium">Potensi Stok Kembali:</span>
                <span className="font-black text-emerald-600 text-sm">+{totalItemsCount} Pcs Produk</span>
              </div>
            </div>
            <p className="text-[11px] text-rose-700 italic">
              Transaksi pada bulan lainnya di luar {getMonthLabel(selectedMonth)} tidak akan tersentuh sama sekali.
            </p>
          </div>

          {/* Reversal Stock Checkbox */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={revertStock}
                onChange={(e) => setRevertStock(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  Kembalikan Stok Obat ke Cabang Terkait (Reversal Saldo)
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Centang untuk mengembalikan kuantitas fisik obat/skincare yang pernah terjual di bulan ini kembali ke rak stok cabang.
                </span>
              </div>
            </label>
          </div>

          {/* Admin Password Input */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                Masukkan Password Admin untuk Konfirmasi:
              </label>
              <span className="text-[10px] text-slate-400">(Default: rca2026)</span>
            </div>
            <input
              type="password"
              placeholder="Masukkan kata sandi admin..."
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setErrorMessage('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {errorMessage && (
              <p className="text-xs text-rose-600 font-semibold">{errorMessage}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={() => {
              onClose();
              setPasswordInput('');
              setErrorMessage('');
            }}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            disabled={!passwordInput}
            onClick={handleExecute}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Eksekusi Reset Bulan {selectedMonth}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
