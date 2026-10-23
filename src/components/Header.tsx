import React from 'react';
import {
  Building2,
  Sparkles,
  FileSpreadsheet,
  Download,
  PlusCircle,
  Bell,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
} from 'lucide-react';
import { BranchId, FilterBranchId, StockItem, BranchInfo } from '../types/clinic';

interface HeaderProps {
  currentTab: 'dashboard' | 'pos' | 'stock' | 'transactions' | 'admin';
  setCurrentTab: (tab: 'dashboard' | 'pos' | 'stock' | 'transactions' | 'admin') => void;
  selectedBranch: FilterBranchId;
  setSelectedBranch: (branch: FilterBranchId) => void;
  branches: BranchInfo[];
  stockItems: StockItem[];
  onOpenNewTransaction: () => void;
  onOpenGoogleSheets: () => void;
  onOpenLowStock: () => void;
  onOpenAiAdvisor: () => void;
  onOpenDoc: () => void;
  onExportExcel: () => void;
  onOpenDownloadApk: () => void;
  isSheetsConnected: boolean;
  sheetsUrl: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedBranch,
  setSelectedBranch,
  branches,
  stockItems,
  onOpenNewTransaction,
  onOpenGoogleSheets,
  onOpenLowStock,
  onOpenAiAdvisor,
  onOpenDoc,
  onExportExcel,
  onOpenDownloadApk,
  isSheetsConnected,
  sheetsUrl,
}) => {
  // Count low stock items based on selected branch or all
  const lowStockCount = stockItems.filter((item) => {
    if (selectedBranch === 'all') {
      return (
        item.jumlah.springhill <= item.minStockThreshold ||
        item.jumlah.sudirman <= item.minStockThreshold ||
        item.jumlah['pangkalan-balai'] <= item.minStockThreshold
      );
    }
    const branchQty =
      selectedBranch === 'springhill'
        ? item.jumlah.springhill
        : selectedBranch === 'sudirman'
        ? item.jumlah.sudirman
        : item.jumlah['pangkalan-balai'];
    return branchQty <= item.minStockThreshold;
  }).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
        {/* Top Banner & Quick Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Branding */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setCurrentTab('dashboard')}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-rose-200">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    RCA
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    RCA Skincare
                  </h1>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Clinic ERP
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Pusat Kendali 3 Cabang: Springhill • Sudirman • Pangkalan Balai
                </p>
              </div>
            </div>

            {/* Branch Switcher Pill (Desktop) */}
            <div className="hidden lg:flex items-center p-1.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setSelectedBranch('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedBranch === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-rose-500" />
                Semua Cabang (Terpusat)
              </button>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedBranch === b.id
                      ? 'bg-white text-slate-900 shadow-xs font-bold border-l-2'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  style={{
                    borderLeftColor: selectedBranch === b.id ? b.accentColor : 'transparent',
                  }}
                >
                  {b.name.replace('RCA Skincare ', '')}
                </button>
              ))}
            </div>

            {/* Right Action Icons & Buttons */}
            <div className="flex items-center gap-2">
              {/* Unduh APK Button */}
              <button
                onClick={onOpenDownloadApk}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                title="Unduh APK Mobile untuk HP Android / iOS"
              >
                <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Unduh APK</span>
              </button>

              {/* Google Sheets Status Badge */}
              <button
                onClick={onOpenGoogleSheets}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isSheetsConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Integrasi Google Spreadsheet"
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${isSheetsConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="hidden md:inline">Google Sheets</span>
                {isSheetsConnected ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                )}
              </button>

              {/* Low Stock Alert Bell */}
              <button
                onClick={onOpenLowStock}
                className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                title="Notifikasi Stok Menipis"
              >
                <Bell className="w-4 h-4" />
                {lowStockCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                    {lowStockCount}
                  </span>
                )}
              </button>

              {/* AI Advisor Button */}
              <button
                onClick={onOpenAiAdvisor}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-spin-slow" />
                <span className="hidden sm:inline">AI Advisor</span>
              </button>

              {/* Kasir POS Quick Button */}
              <button
                onClick={() => setCurrentTab('pos')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Buka Kasir POS</span>
              </button>

              {/* Documentation Button */}
              <button
                onClick={onOpenDoc}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Panduan & Dokumentasi"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Branch Selector */}
          <div className="lg:hidden pb-3 flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setSelectedBranch('all')}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${
                selectedBranch === 'all'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Semua Cabang
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${
                  selectedBranch === b.id
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {b.name.replace('RCA Skincare ', '')}
              </button>
            ))}
          </div>

          {/* Tab Navigation (Desktop) */}
          <div className="hidden md:flex items-center gap-6 border-t border-slate-100 pt-2 -mb-px">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`pb-2.5 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'border-rose-600 text-rose-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dasbor Pemantauan Terpusat</span>
            </button>

            {/* Dedicated POS Tab */}
            <button
              onClick={() => setCurrentTab('pos')}
              className={`pb-2.5 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                currentTab === 'pos'
                  ? 'border-rose-600 text-rose-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-rose-600" />
              <span>Kasir POS (Penjualan Cepat)</span>
            </button>

            <button
              onClick={() => setCurrentTab('stock')}
              className={`pb-2.5 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                currentTab === 'stock'
                  ? 'border-rose-600 text-rose-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Stok Obat & Stock Opname</span>
              {lowStockCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('transactions')}
              className={`pb-2.5 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                currentTab === 'transactions'
                  ? 'border-rose-600 text-rose-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Riwayat Transaksi & Mutasi</span>
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`pb-2.5 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'border-rose-600 text-rose-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin, Keuangan & Profil Cabang</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'dashboard' ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Dasbor</span>
        </button>

        <button
          onClick={() => setCurrentTab('stock')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'stock' ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Package className="w-5 h-5" />
          {lowStockCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
          <span className="text-[10px] mt-0.5">Stok</span>
        </button>

        {/* Center Floating Action Button for Dedicated Mobile POS */}
        <button
          onClick={() => setCurrentTab('pos')}
          className="flex flex-col items-center -mt-5"
          title="Buka Kasir POS"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              currentTab === 'pos'
                ? 'bg-rose-700 text-white ring-4 ring-rose-200 shadow-rose-300'
                : 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-rose-200'
            }`}
          >
            <ShoppingCart className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-bold text-rose-600 mt-0.5">Kasir POS</span>
        </button>

        <button
          onClick={() => setCurrentTab('transactions')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'transactions' ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Transaksi</span>
        </button>

        <button
          onClick={() => setCurrentTab('admin')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            currentTab === 'admin' ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Admin</span>
        </button>

        <button
          onClick={onOpenDownloadApk}
          className="flex flex-col items-center py-1 px-2 text-slate-500 hover:text-slate-800 transition-colors"
          title="Unduh APK"
        >
          <Smartphone className="w-5 h-5 text-amber-600" />
          <span className="text-[10px] mt-0.5 text-amber-700 font-semibold">APK</span>
        </button>
      </nav>
    </>
  );
};
