import React, { useState } from 'react';
import {
  PlusCircle,
  Trash2,
  X,
  ShoppingCart,
  User,
  CreditCard,
  Building2,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { StockItem, BranchId, Transaction, TransactionItem, PaymentMethod, TransactionCategory } from '../types/clinic';
import { BRANCHES } from '../data/initialData';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItems: StockItem[];
  defaultBranch?: BranchId | 'NONE';
  onSubmitTransaction: (trx: Transaction) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  stockItems,
  defaultBranch = 'NONE',
  onSubmitTransaction,
}) => {
  const [branch, setBranch] = useState<BranchId | 'NONE'>(defaultBranch);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [medicalRecordNo, setMedicalRecordNo] = useState(`RM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [attendingDoctor, setAttendingDoctor] = useState('dr. Rina Cahyani, Sp.DVE');
  const [category, setCategory] = useState<TransactionCategory>('Resep Obat & Skincare');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Cart items
  const [cartItems, setCartItems] = useState<TransactionItem[]>([
    {
      itemId: stockItems[0]?.id || '',
      nama: stockItems[0]?.nama || '',
      qty: 1,
      hargaSatuan: stockItems[0]?.hargaJual || 0,
      subtotal: stockItems[0]?.hargaJual || 0,
      isSkincareProduct: true,
    },
  ]);

  if (!isOpen) return null;

  // Handle changing branch updates doctor if appropriate
  const handleBranchChange = (newBranch: BranchId | 'NONE') => {
    setBranch(newBranch);
    if (newBranch !== 'NONE') {
      const bInfo = BRANCHES.find((b) => b.id === newBranch);
      if (bInfo) setAttendingDoctor(bInfo.headDoctor);
    }
  };

  const handleAddItem = () => {
    if (stockItems.length === 0) return;
    const defaultProduct = stockItems[0];
    setCartItems([
      ...cartItems,
      {
        itemId: defaultProduct.id,
        nama: defaultProduct.nama,
        qty: 1,
        hargaSatuan: defaultProduct.hargaJual,
        subtotal: defaultProduct.hargaJual,
        isSkincareProduct: true,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (cartItems.length <= 1) return;
    const next = [...cartItems];
    next.splice(index, 1);
    setCartItems(next);
  };

  const handleItemSelect = (index: number, selectedItemId: string) => {
    const itm = stockItems.find((i) => i.id === selectedItemId);
    if (!itm) return;
    const next = [...cartItems];
    next[index] = {
      itemId: itm.id,
      nama: itm.nama,
      qty: 1,
      hargaSatuan: itm.hargaJual,
      subtotal: itm.hargaJual,
      isSkincareProduct: true,
    };
    setCartItems(next);
  };

  const handleQtyChange = (index: number, newQty: number) => {
    const validQty = Math.max(1, newQty);
    const next = [...cartItems];
    next[index].qty = validQty;
    next[index].subtotal = validQty * next[index].hargaSatuan;
    setCartItems(next);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (branch === 'NONE') {
      alert('⚠️ Cabang klinik belum dipilih! Silakan pilih cabang klinik terlebih dahulu.');
      return;
    }
    if (!patientName.trim()) {
      alert('Nama pasien wajib diisi.');
      return;
    }

    // Verify stock availability
    for (const item of cartItems) {
      if (item.isSkincareProduct) {
        const stockRecord = stockItems.find((s) => s.id === item.itemId);
        const availableInBranch = stockRecord ? stockRecord.jumlah[branch] ?? 0 : 0;
        if (item.qty > availableInBranch) {
          alert(
            `Stok untuk "${item.nama}" di cabang ${BRANCHES.find((b) => b.id === branch)?.name} hanya tersisa ${availableInBranch} pcs. Silakan kurangi kuantitas atau lakukan transfer stok terlebih dahulu.`
          );
          return;
        }
      }
    }

    const branchPrefix =
      branch === 'springhill' ? 'SH' : branch === 'sudirman' ? 'SD' : 'PB';
    const dateSlug = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    const newTransaction: Transaction = {
      id: `TRX-${branchPrefix}-${dateSlug}-${randomSuffix}`,
      branch,
      timestamp: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      patientName,
      patientPhone: patientPhone || '0812-xxxx-xxxx',
      medicalRecordNo,
      attendingDoctor,
      category,
      items: cartItems,
      subtotal,
      discount,
      tax: 0,
      total: grandTotal,
      paymentMethod,
      paymentStatus: 'Lunas',
      notes,
    };

    onSubmitTransaction(newTransaction);
    onClose();
  };

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-rose-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-600 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Kasir Transaksi & Resep Obat Pasien</h3>
              <p className="text-xs text-rose-100">
                Pencatatan invoice dan pemotongan stok obat/skincare otomatis
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Branch & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cabang Klinik <span className="text-rose-600 font-bold">*Wajib</span>
              </label>
              <select
                value={branch}
                onChange={(e) => handleBranchChange(e.target.value as BranchId | 'NONE')}
                className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border transition-all focus:outline-none ${
                  branch === 'NONE'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/40'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="NONE">⚠️ -- PILIH CABANG (DEFAULT: NONE) --</option>
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Transaksi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="Resep Obat & Skincare">Resep Obat & Skincare</option>
                <option value="Treatment">Tindakan / Treatment Medis</option>
                <option value="Paket Bundling">Paket Bundling (Laser + Krim)</option>
                <option value="Konsultasi Dokter">Konsultasi Dokter Kulit</option>
              </select>
            </div>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pasien *
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Contoh: Ny. Sarah Amalia"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. WhatsApp / HP
              </label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Rekam Medis (RM)
              </label>
              <input
                type="text"
                value={medicalRecordNo}
                onChange={(e) => setMedicalRecordNo(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Doctor in charge */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dokter / Beautician Penanggung Jawab
            </label>
            <input
              type="text"
              value={attendingDoctor}
              onChange={(e) => setAttendingDoctor(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              required
            />
          </div>

          {/* Item List (Cart) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Obat / Skincare / Treatment Dibeli
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambah Baris Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {cartItems.map((item, idx) => {
                const stockRecord = stockItems.find((s) => s.id === item.itemId);
                const availableStock =
                  stockRecord && branch !== 'NONE' ? stockRecord.jumlah[branch] ?? 0 : 0;
                const isOutOfStock = branch !== 'NONE' && availableStock <= 0;

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <select
                        value={item.itemId}
                        onChange={(e) => handleItemSelect(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                      >
                        {stockItems.map((itm) => (
                          <option key={itm.id} value={itm.id}>
                            {itm.nama} ({itm.merkProduk}) - {formatRp(itm.hargaJual)}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 flex items-center gap-2 text-[10px]">
                        <span
                          className={`font-semibold ${
                            availableStock <= 5 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          Tersedia di cabang ini: {availableStock} {stockRecord?.satuan || 'pcs'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                      {/* Qty */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max={availableStock > 0 ? availableStock : 99}
                          value={item.qty}
                          onChange={(e) => handleQtyChange(idx, parseInt(e.target.value, 10) || 1)}
                          className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="text-right w-24">
                        <span className="text-xs font-bold text-slate-900">
                          {formatRp(item.subtotal)}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={cartItems.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['QRIS', 'Transfer BCA', 'Transfer Mandiri', 'Tunai', 'Debit/Kredit'] as PaymentMethod[]).map(
                  (method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        paymentMethod === method
                          ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Billing Calculation */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Items:</span>
                <span className="font-semibold text-slate-900">{formatRp(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Diskon Promo (Rp):</span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={discount}
                  onChange={(e) => setDiscount(parseInt(e.target.value, 10) || 0)}
                  className="w-24 px-2 py-0.5 text-right bg-white border border-slate-200 rounded text-xs font-bold text-rose-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">Grand Total:</span>
                <span className="font-black text-rose-600 text-lg">{formatRp(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Anjuran Dokter
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Gunakan krim malam tipis-tipis, kontrol ulang dalam 14 hari."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={branch === 'NONE'}
              className={`px-6 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors ${
                branch === 'NONE'
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {branch === 'NONE' ? 'Wajib Pilih Cabang' : 'Simpan Transaksi & Cetak Nota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
