import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Building2,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { BranchInfo } from '../types/clinic';

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: BranchInfo | null;
  onSaveBranch: (updated: BranchInfo) => void;
}

export const EditBranchModal: React.FC<EditBranchModalProps> = ({
  isOpen,
  onClose,
  branch,
  onSaveBranch,
}) => {
  const [headDoctor, setHeadDoctor] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (branch) {
      setHeadDoctor(branch.headDoctor || '');
      setTagline(branch.tagline || '');
      setPhone(branch.phone || '');
      setAddress(branch.address || '');
      setCity(branch.city || '');
      setIsSaved(false);
    }
  }, [branch]);

  if (!isOpen || !branch) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headDoctor.trim()) {
      alert('Nama Penanggung Jawab Medis tidak boleh kosong.');
      return;
    }

    const updated: BranchInfo = {
      ...branch,
      headDoctor: headDoctor.trim(),
      tagline: tagline.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
    };

    onSaveBranch(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 flex flex-col">
        {/* Header */}
        <div
          className="p-5 text-white flex items-center justify-between"
          style={{ backgroundColor: branch.accentColor || '#e11d48' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Edit Penanggung Jawab Cabang</h3>
              <p className="text-xs text-white/90">
                {branch.name} • {branch.city}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Penanggung Jawab (Primary Focus) */}
          <div className="space-y-1.5 bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200">
            <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <UserCheck className="w-4 h-4 text-rose-600" />
              <span>Nama Penanggung Jawab / Kepala Dokter Medis:</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={headDoctor}
              onChange={(e) => setHeadDoctor(e.target.value)}
              placeholder="Contoh: dr. Raden Citra Anggraini, Sp.DV"
              className="w-full px-3.5 py-2.5 bg-white border border-rose-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <p className="text-[10px] text-slate-500">
              Nama ini akan muncul pada kartu pemantauan dashboard, kepala struk kasir, dan laporan resmi cabang.
            </p>
          </div>

          {/* Tagline Cabang */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Tagline / Sub-Identitas Cabang:
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Contoh: Flagship Aesthetic & Laser Center"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* No. Telepon / WhatsApp */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Nomor Kontak / WhatsApp Cabang:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 0812-7889-1001"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Alamat & Kota */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Alamat Fisik Cabang:
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Springhill Grand Boulevard No. 18"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Kota / Kab:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Palembang"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Tersimpan otomatis ke memori lokal
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
