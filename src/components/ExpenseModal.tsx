import React, { useState, useEffect } from 'react';
import { DollarSign, X, Save, Building2 } from 'lucide-react';
import { Expense, BranchId, ExpenseCategory } from '../types/clinic';
import { BRANCHES } from '../data/initialData';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
  defaultBranch?: BranchId;
  onSaveExpense: (expense: Expense) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
  defaultBranch = 'springhill',
  onSaveExpense,
}) => {
  const [branch, setBranch] = useState<BranchId>(defaultBranch);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Operasional & Utilitas');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Kas Tunai' | 'Transfer BCA' | 'Transfer Mandiri' | 'Lainnya'>('Transfer BCA');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [recordedBy, setRecordedBy] = useState('Admin Keuangan RCA');

  useEffect(() => {
    if (expenseToEdit) {
      setBranch(expenseToEdit.branch);
      setDate(expenseToEdit.date);
      setCategory(expenseToEdit.category);
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount);
      setPaidTo(expenseToEdit.paidTo);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setReceiptNumber(expenseToEdit.receiptNumber || '');
      setNotes(expenseToEdit.notes || '');
      setRecordedBy(expenseToEdit.recordedBy);
    } else {
      setBranch(defaultBranch);
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Operasional & Utilitas');
      setTitle('');
      setAmount(0);
      setPaidTo('');
      setPaymentMethod('Transfer BCA');
      setReceiptNumber(`BKK-${Date.now().toString().slice(-4)}`);
      setNotes('');
    }
  }, [expenseToEdit, defaultBranch, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) {
      alert('Judul pengeluaran dan nominal harus valid.');
      return;
    }

    const branchPrefix = branch === 'springhill' ? 'SH' : branch === 'sudirman' ? 'SD' : 'PB';
    const dateSlug = date.replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);

    const expense: Expense = {
      id: expenseToEdit ? expenseToEdit.id : `EXP-${branchPrefix}-${dateSlug}-${rand}`,
      branch,
      date,
      category,
      title,
      amount,
      paidTo: paidTo || 'Pihak Terkait',
      paymentMethod,
      receiptNumber,
      notes,
      recordedBy,
    };

    onSaveExpense(expense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {expenseToEdit ? 'Edit Catatan Pengeluaran' : 'Catat Pengeluaran Kas Baru'}
              </h3>
              <p className="text-xs text-amber-100">
                Pencatatan beban operasional, gaji terapis, dan restock farmasi
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cabang Klinik *</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as BranchId)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name.replace('RCA Skincare ', '')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pengeluaran *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kategori Pengeluaran *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="Operasional & Utilitas">Operasional & Utilitas (Listrik, Air, Wifi)</option>
              <option value="Gaji & Honor Dokter/Terapis">Gaji & Honor Dokter / Terapis</option>
              <option value="Pembelian Suplier & Bahan">Pembelian Suplier & Bahan Habis Pakai</option>
              <option value="Sewa Tempat">Sewa Tempat & Gedung</option>
              <option value="Pemasaran & Iklan">Pemasaran & Iklan (Social Media Ads)</option>
              <option value="Maintenance Alat Medis/Laser">Maintenance Alat Medis / Mesin Laser</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama / Keperluan Pengeluaran *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Tagihan Listrik PLN Klinik Sudirman"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nominal (Rp) *</label>
              <input
                type="number"
                min="1000"
                step="5000"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-rose-600 text-sm"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dibayarkan Kepada</label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="Contoh: PLN / Supplier"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Metode Bayar</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Transfer BCA">Transfer BCA</option>
                <option value="Transfer Mandiri">Transfer Mandiri</option>
                <option value="Kas Tunai">Kas Tunai (Petty Cash)</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Bukti / Nota (Opsional)</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Pengeluaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
