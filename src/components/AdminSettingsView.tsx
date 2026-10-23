import React, { useState, useRef } from 'react';
import {
  Settings,
  Tag,
  DollarSign,
  Database,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Save,
  Search,
  Filter,
  X,
} from 'lucide-react';
import {
  StockItem,
  Transaction,
  Expense,
  FilterBranchId,
  BranchId,
  BranchInfo,
  ClinicBackupData,
} from '../types/clinic';

interface AdminSettingsViewProps {
  productTypes: string[];
  productBrands: string[];
  stockItems: StockItem[];
  transactions: Transaction[];
  expenses: Expense[];
  branches: BranchInfo[];
  selectedBranch: FilterBranchId;
  setSelectedBranch: (b: FilterBranchId) => void;
  onAddProductType: (name: string) => void;
  onEditProductType: (oldName: string, newName: string) => void;
  onDeleteProductType: (name: string) => void;
  onAddProductBrand: (name: string) => void;
  onEditProductBrand: (oldName: string, newName: string) => void;
  onDeleteProductBrand: (name: string) => void;
  onOpenNewExpense: () => void;
  onOpenEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onRestoreBackup: (backup: ClinicBackupData) => void;
  onResetTransactions: () => void;
  onResetToFactory: () => void;
  onOpenMonthlyReset: () => void;
  adminPassword: string;
  onUpdateAdminPassword: (newPass: string) => void;
  onOpenEditBranch: (branch: BranchInfo) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  productTypes,
  productBrands,
  stockItems,
  transactions,
  expenses,
  branches,
  selectedBranch,
  setSelectedBranch,
  onAddProductType,
  onEditProductType,
  onDeleteProductType,
  onAddProductBrand,
  onEditProductBrand,
  onDeleteProductBrand,
  onOpenNewExpense,
  onOpenEditExpense,
  onDeleteExpense,
  onRestoreBackup,
  onResetTransactions,
  onResetToFactory,
  onOpenMonthlyReset,
  adminPassword,
  onUpdateAdminPassword,
  onOpenEditBranch,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'master' | 'finance' | 'branches' | 'backup'>('finance');

  // Master Data Inputs
  const [newTypeName, setNewTypeName] = useState('');
  const [editingType, setEditingType] = useState<{ oldName: string; newName: string } | null>(null);

  const [newBrandName, setNewBrandName] = useState('');
  const [editingBrand, setEditingBrand] = useState<{ oldName: string; newName: string } | null>(null);

  // Financial Filter
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');

  // Reset confirmation input
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin Password Management state
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);

  // Finance calculations based on selectedBranch
  const filteredTrx = selectedBranch === 'all'
    ? transactions
    : transactions.filter((t) => t.branch === selectedBranch);

  const filteredExpenses = expenses.filter((e) => {
    if (selectedBranch !== 'all' && e.branch !== selectedBranch) return false;
    if (expenseCategoryFilter !== 'all' && e.category !== expenseCategoryFilter) return false;
    if (expenseSearch) {
      const q = expenseSearch.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.paidTo.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalOmzet = filteredTrx.reduce((acc, t) => acc + t.total, 0);

  // Calculate COGS (HPP modal produk yang terjual)
  const totalHPP = filteredTrx.reduce((acc, t) => {
    const trxHPP = t.items.reduce((iAcc, item) => {
      const stockRef = stockItems.find((s) => s.id === item.itemId);
      const modal = stockRef ? stockRef.hargaModal : item.hargaSatuan * 0.5;
      return iAcc + modal * item.qty;
    }, 0);
    return acc + trxHPP;
  }, 0);

  const totalPengeluaran = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const labaKotor = totalOmzet - totalHPP;
  const labaBersih = labaKotor - totalPengeluaran;

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  // Backup Export
  const handleExportBackup = () => {
    const backup: ClinicBackupData = {
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      clinicName: 'RCA Skincare',
      stockItems,
      transactions,
      expenses,
      productTypes,
      productBrands,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeDate = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `RCA_Skincare_Backup_${safeDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Backup Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.stockItems && parsed.transactions) {
          onRestoreBackup(parsed);
          alert('Data backup berhasil dipulihkan!');
        } else {
          alert('Format file JSON tidak valid sebagai backup RCA Skincare.');
        }
      } catch (err: any) {
        alert('Gagal membaca file backup: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Admin Dashboard & Pusat Kontrol Klinik
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Konfigurasi Master, Keuangan & Backup
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola jenis & merk obat, pengeluaran kas operasional, laba bersih, serta ekspor-impor pencadangan data.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('finance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'finance'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Keuangan & Laba Rugi</span>
          </button>
          <button
            onClick={() => setActiveSubTab('master')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'master'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Jenis & Merk Produk</span>
          </button>
          <button
            onClick={() => setActiveSubTab('branches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'branches'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Profil Cabang & Penanggung Jawab</span>
          </button>
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'backup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-600" />
            <span>Pencadangan & Reset</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: KEUANGAN & LABA RUGI */}
      {activeSubTab === 'finance' && (
        <div className="space-y-6">
          {/* Profit & Loss Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Omzet Penjualan</span>
              <div className="text-xl font-black text-slate-900 mt-2">{formatRp(totalOmzet)}</div>
              <span className="text-[10px] text-slate-500">{filteredTrx.length} transaksi</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Total HPP / Modal Obat</span>
              <div className="text-xl font-black text-slate-700 mt-2">{formatRp(totalHPP)}</div>
              <span className="text-[10px] text-slate-500">Harga pokok produk terjual</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Beban Operasional</span>
              <div className="text-xl font-black text-amber-600 mt-2">{formatRp(totalPengeluaran)}</div>
              <span className="text-[10px] text-slate-500">{filteredExpenses.length} pos pengeluaran kas</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-4 shadow-md">
              <span className="text-[11px] font-bold text-emerald-100 uppercase block">Estimasi Laba Bersih</span>
              <div className="text-2xl font-black mt-2">{formatRp(labaBersih)}</div>
              <span className="text-[10px] text-emerald-100">
                Omzet ({formatRp(totalOmzet)}) - HPP ({formatRp(totalHPP)}) - Beban ({formatRp(totalPengeluaran)})
              </span>
            </div>
          </div>

          {/* Expenses Register Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Riwayat Pengeluaran Kas & Beban Operasional</h3>
                <p className="text-xs text-slate-500">Pencatatan kas keluar per cabang dengan fitur edit & hapus</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenNewExpense}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catat Pengeluaran Baru</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari keperluan atau penerima..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value as FilterBranchId)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value="all">Semua Cabang</option>
                  <option value="springhill">Springhill</option>
                  <option value="sudirman">Sudirman</option>
                  <option value="pangkalan-balai">Pangkalan Balai</option>
                </select>

                <select
                  value={expenseCategoryFilter}
                  onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Gaji & Honor Dokter/Terapis">Gaji & Honor Dokter</option>
                  <option value="Operasional & Utilitas">Operasional & Utilitas</option>
                  <option value="Pembelian Suplier & Bahan">Pembelian Suplier</option>
                  <option value="Sewa Tempat">Sewa Tempat</option>
                  <option value="Pemasaran & Iklan">Pemasaran & Iklan</option>
                  <option value="Maintenance Alat Medis/Laser">Maintenance Alat Medis</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Tanggal & ID</th>
                    <th className="py-3 px-3">Cabang</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-4">Nama Pengeluaran / Keperluan</th>
                    <th className="py-3 px-3">Dibayar Ke</th>
                    <th className="py-3 px-3 text-right">Nominal (Rp)</th>
                    <th className="py-3 px-3 text-center w-24">Aksi CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Belum ada catatan pengeluaran pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => {
                      const branchInfo = branches.find((b) => b.id === exp.branch);
                      return (
                        <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">{exp.date}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{exp.id}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                              style={{ backgroundColor: branchInfo?.accentColor || '#64748b' }}
                            >
                              {branchInfo?.name.replace('RCA Skincare ', '')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">
                            {exp.title}
                            {exp.notes && (
                              <span className="block text-[10px] text-slate-400 font-normal italic">
                                {exp.notes}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {exp.paidTo}
                            <span className="block text-[10px] text-slate-400">{exp.paymentMethod}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-rose-600">
                            {formatRp(exp.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onOpenEditExpense(exp)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                title="Edit Pengeluaran"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteExpense(exp)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                                title="Hapus Pengeluaran"
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

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs flex justify-between font-bold text-slate-700">
              <span>Total Beban Pengeluaran Terpilih:</span>
              <span className="text-rose-600 font-black">{formatRp(totalPengeluaran)}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MASTER JENIS & MERK PRODUK */}
      {activeSubTab === 'master' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jenis Produk (Product Types) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  Master Jenis Sediaan Produk ({productTypes.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Kategori farmasi seperti Serum, Krim Pagi, Krim Malam, Toner, Peeling
                </p>
              </div>
            </div>

            {/* Add new type */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tambah jenis baru (misal: Eye Cream)..."
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (newTypeName.trim()) {
                    onAddProductType(newTypeName.trim());
                    setNewTypeName('');
                  }
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {/* List with inline Edit & Delete */}
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {productTypes.map((type) => {
                const countUsed = stockItems.filter((i) => i.jenis === type).length;
                const isEditing = editingType?.oldName === type;

                return (
                  <div key={type} className="py-2.5 flex items-center justify-between text-xs">
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingType.newName}
                          onChange={(e) => setEditingType({ ...editingType, newName: e.target.value })}
                          className="px-2 py-1 border border-blue-400 rounded-lg text-xs w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (editingType.newName.trim()) {
                              onEditProductType(editingType.oldName, editingType.newName.trim());
                              setEditingType(null);
                            }
                          }}
                          className="p-1 bg-emerald-600 text-white rounded-lg"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingType(null)}
                          className="p-1 bg-slate-200 text-slate-700 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-slate-800">{type}</span>
                        <span className="ml-2 text-[10px] text-slate-400">
                          ({countUsed} produk menggunakan jenis ini)
                        </span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingType({ oldName: type, newName: type })}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Ubah Nama Jenis"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProductType(type)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus Jenis"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Merk Produk (Product Brands) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-rose-600" />
                  Master Merk Produk / Brand ({productBrands.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Label merk produk resmi yang beredar di jaringan RCA Skincare
                </p>
              </div>
            </div>

            {/* Add new brand */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tambah merk baru (misal: RCA Platinum Lab)..."
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (newBrandName.trim()) {
                    onAddProductBrand(newBrandName.trim());
                    setNewBrandName('');
                  }
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {/* List with inline Edit & Delete */}
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {productBrands.map((brand) => {
                const countUsed = stockItems.filter((i) => i.merkProduk === brand).length;
                const isEditing = editingBrand?.oldName === brand;

                return (
                  <div key={brand} className="py-2.5 flex items-center justify-between text-xs">
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingBrand.newName}
                          onChange={(e) => setEditingBrand({ ...editingBrand, newName: e.target.value })}
                          className="px-2 py-1 border border-rose-400 rounded-lg text-xs w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (editingBrand.newName.trim()) {
                              onEditProductBrand(editingBrand.oldName, editingBrand.newName.trim());
                              setEditingBrand(null);
                            }
                          }}
                          className="p-1 bg-emerald-600 text-white rounded-lg"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingBrand(null)}
                          className="p-1 bg-slate-200 text-slate-700 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-slate-800">{brand}</span>
                        <span className="ml-2 text-[10px] text-slate-400">
                          ({countUsed} produk menggunakan merk ini)
                        </span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingBrand({ oldName: brand, newName: brand })}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Ubah Nama Merk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProductBrand(brand)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus Merk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PROFIL CABANG & PENANGGUNG JAWAB */}
      {activeSubTab === 'branches' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-rose-600" />
                Manajemen Profil Cabang & Penanggung Jawab Medis (Head Doctor)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Edit nama penanggung jawab klinik, dokter penanggung jawab resep, nomor WhatsApp, dan alamat operasional cabang.
              </p>
            </div>
            <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl border border-rose-200">
              3 Titik Cabang Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {branches.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: b.accentColor }}
                      ></span>
                      <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                    </div>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {b.city}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 italic mt-2">{b.tagline}</p>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
                      <span className="text-[10px] font-bold text-rose-700 uppercase block">
                        Penanggung Jawab Medis:
                      </span>
                      <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                        {b.headDoctor}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Dokter penanggung jawab pada resep & dashboard
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                      <div>
                        <span className="text-slate-400">Kontak: </span>
                        <strong className="text-slate-700">{b.phone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Alamat: </span>
                        <span className="text-slate-700">{b.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenEditBranch(b)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Edit Penanggung Jawab & Info Cabang</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PENCADANGAN & RESET TRANSAKSI */}
      {activeSubTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup & Restore */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                Pencadangan & Pemulihan Basis Data (Backup & Restore)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Amankan seluruh data stok, transaksi kasir, pengeluaran kas, dan master kategori dalam 1 berkas JSON.
              </p>
            </div>

            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-purple-900 block">
                1. Unduh Berkas Cadangan Lengkap (.json)
              </span>
              <p className="text-[11px] text-purple-700">
                Menyimpan {stockItems.length} produk, {transactions.length} invoice, dan {expenses.length} pengeluaran ke dalam file lokal untuk arsip offline.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Backup (.json)</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                2. Pulihkan Data dari Berkas (.json)
              </span>
              <p className="text-[11px] text-slate-600">
                Unggah file JSON backup yang pernah diunduh sebelumnya untuk memulihkan seluruh data klinik.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih & Pulihkan File Backup JSON</span>
              </button>
            </div>
          </div>

          {/* Reset Transactions, Monthly Reset & Admin Password */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Manajemen Keamanan & Reset Transaksi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengosongan transaksi per bulan, pengelolaan password admin, dan pemulihan data bawaan.
              </p>
            </div>

            {/* 1. Reset Transaksi Per Bulan (Password Protected) */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  Reset Transaksi Per Bulan (Aman & Fleksibel)
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  Dilindungi Password
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                Hapus transaksi penjualan pada bulan tertentu saja (misal: penutupan buku bulanan) dengan opsi pengembalian saldo stok obat otomatis (reversal).
              </p>
              <button
                onClick={onOpenMonthlyReset}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Buka Menu Reset Transaksi Per Bulan</span>
              </button>
            </div>

            {/* 2. Admin Password Configuration */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <span className="text-xs font-bold text-slate-800 block">
                Pengaturan Password Admin (Otorisasi Reset)
              </span>
              <p className="text-[11px] text-slate-500">
                Password saat ini: <strong className="font-mono text-slate-800">{adminPassword}</strong>. Ubah password untuk meningkatkan keamanan otorisasi tindakan kritis:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Ketik password admin baru..."
                  value={newPasswordInput}
                  onChange={(e) => {
                    setNewPasswordInput(e.target.value);
                    setIsPasswordSaved(false);
                  }}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
                <button
                  onClick={() => {
                    if (newPasswordInput.trim()) {
                      onUpdateAdminPassword(newPasswordInput.trim());
                      setNewPasswordInput('');
                      setIsPasswordSaved(true);
                      setTimeout(() => setIsPasswordSaved(false), 2500);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Simpan Password
                </button>
              </div>
              {isPasswordSaved && (
                <span className="text-[11px] font-bold text-emerald-600 block">
                  ✓ Password admin berhasil diperbarui!
                </span>
              )}
            </div>

            {/* 3. Reset All Transactions */}
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-rose-900 block">
                Reset Seluruh Transaksi & Catatan Pengeluaran
              </span>
              <p className="text-[11px] text-rose-700">
                Mengosongkan semua riwayat penjualan dan beban tanpa menghapus katalog obat.
              </p>
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Kosongkan Seluruh Transaksi</span>
              </button>
            </div>

            {/* 4. Factory Reset */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-800 block">Reset ke Sampel Bawaan Awal</span>
                <span className="text-[10px] text-slate-500">12 produk master & transaksi percontohan</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin mengatur ulang sistem ke data percontohan awal klinik? Semua data kustom saat ini akan digantikan.')) {
                    onResetToFactory();
                    alert('Sistem berhasil dikembalikan ke data percontohan awal!');
                  }
                }}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
              >
                Pulihkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Konfirmasi Reset Transaksi</h4>
                <p className="text-xs text-slate-500">Tindakan ini menghapus seluruh riwayat penjualan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Untuk mencegah ketidaksengajaan, ketik kalimat <strong className="font-mono text-rose-600">RESET-TRANSAKSI</strong> di bawah ini untuk melanjutkan:
            </p>

            <input
              type="text"
              placeholder="Ketik RESET-TRANSAKSI di sini..."
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  setResetConfirmText('');
                }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                Batal
              </button>
              <button
                disabled={resetConfirmText !== 'RESET-TRANSAKSI'}
                onClick={() => {
                  onResetTransactions();
                  setIsResetConfirmOpen(false);
                  setResetConfirmText('');
                  alert('Riwayat transaksi penjualan berhasil direset.');
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Konfirmasi Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
