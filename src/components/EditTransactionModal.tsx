import React, { useState, useEffect } from 'react';
import { Edit3, X, Save } from 'lucide-react';
import { Transaction, PaymentMethod, TransactionCategory } from '../types/clinic';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSaveTransaction: (updated: Transaction) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSaveTransaction,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [medicalRecordNo, setMedicalRecordNo] = useState('');
  const [attendingDoctor, setAttendingDoctor] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Resep Obat & Skincare');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [paymentStatus, setPaymentStatus] = useState<'Lunas' | 'Pending'>('Lunas');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (transaction) {
      setPatientName(transaction.patientName);
      setPatientPhone(transaction.patientPhone);
      setMedicalRecordNo(transaction.medicalRecordNo);
      setAttendingDoctor(transaction.attendingDoctor);
      setCategory(transaction.category);
      setPaymentMethod(transaction.paymentMethod);
      setPaymentStatus(transaction.paymentStatus);
      setNotes(transaction.notes || '');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const updated: Transaction = {
      ...transaction,
      patientName,
      patientPhone,
      medicalRecordNo,
      attendingDoctor,
      category,
      paymentMethod,
      paymentStatus,
      notes,
    };

    onSaveTransaction(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        <div className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Edit Rincian Transaksi</h3>
              <p className="text-xs text-slate-300">
                No Invoice: {transaction.id} ({transaction.timestamp})
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
              <label className="block font-semibold text-slate-700 mb-1">Nama Pasien *</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Rekam Medis (RM)</label>
              <input
                type="text"
                value={medicalRecordNo}
                onChange={(e) => setMedicalRecordNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Transaksi</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Resep Obat & Skincare">Resep Obat & Skincare</option>
                <option value="Treatment">Treatment</option>
                <option value="Paket Bundling">Paket Bundling</option>
                <option value="Konsultasi Dokter">Konsultasi Dokter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dokter / Terapis</label>
            <input
              type="text"
              value={attendingDoctor}
              onChange={(e) => setAttendingDoctor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="QRIS">QRIS</option>
                <option value="Transfer BCA">Transfer BCA</option>
                <option value="Transfer Mandiri">Transfer Mandiri</option>
                <option value="Tunai">Tunai</option>
                <option value="Debit/Kredit">Debit/Kredit</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Pembayaran</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as 'Lunas' | 'Pending')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Lunas">Lunas</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan / Anjuran Dokter</label>
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
              className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
