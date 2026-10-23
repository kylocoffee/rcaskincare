import React, { useState } from 'react';
import {
  FileSpreadsheet,
  X,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Link,
  LogOut,
  ShieldCheck,
  DownloadCloud,
  Database,
  CloudCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
} from '../services/firebaseAuth';
import {
  createRcaSpreadsheet,
  syncFullClinicDataToSheets,
} from '../services/sheetsService';
import { StockItem, Transaction, Expense, BranchInfo } from '../types/clinic';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItems: StockItem[];
  transactions: Transaction[];
  expenses: Expense[];
  branches?: BranchInfo[];
  user: User | null;
  setUser: (u: User | null) => void;
  spreadsheetId: string | null;
  setSpreadsheetId: (id: string | null) => void;
  spreadsheetUrl: string | null;
  setSpreadsheetUrl: (url: string | null) => void;
  lastSyncedAt: string | null;
  setLastSyncedAt: (date: string | null) => void;
  onLoadDataFromSheets?: () => Promise<void>;
  isLoadingFromSheets?: boolean;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  stockItems,
  transactions,
  expenses,
  branches,
  user,
  setUser,
  spreadsheetId,
  setSpreadsheetId,
  spreadsheetUrl,
  setSpreadsheetUrl,
  lastSyncedAt,
  setLastSyncedAt,
  onLoadDataFromSheets,
  isLoadingFromSheets = false,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [customSheetId, setCustomSheetId] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmSyncDialog, setConfirmSyncDialog] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setStatusMessage({
          type: 'success',
          text: `Berhasil terhubung dengan Google Account: ${res.user.email}`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal login ke Google Account.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setStatusMessage({ type: 'success', text: 'Telah keluar dari akun Google.' });
  };

  const handleCreateNewSheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Sesi Google Anda belum aktif. Silakan login terlebih dahulu.' });
      return;
    }

    setIsCreating(true);
    setStatusMessage(null);
    try {
      const { spreadsheetId: newId, spreadsheetUrl: newUrl } = await createRcaSpreadsheet(
        token,
        'RCA Skincare - Database Terpadu 3 Cabang (Stok, Pemasukan & Pengeluaran)'
      );
      setSpreadsheetId(newId);
      setSpreadsheetUrl(newUrl);

      // Perform initial population of all 5 tabs
      await syncFullClinicDataToSheets(token, newId, {
        stockItems,
        transactions,
        expenses,
        branches,
      });

      const now = new Date().toLocaleString('id-ID');
      setLastSyncedAt(now);

      setStatusMessage({
        type: 'success',
        text: 'Database Google Spreadsheet 5-tab berhasil dibuat & disinkronkan ke Google Drive Anda!',
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal membuat Google Spreadsheet.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectExisting = () => {
    if (!customSheetId.trim()) return;
    const cleanId = customSheetId.includes('/d/')
      ? customSheetId.split('/d/')[1].split('/')[0]
      : customSheetId.trim();

    setSpreadsheetId(cleanId);
    setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${cleanId}/edit`);
    setStatusMessage({
      type: 'success',
      text: `Spreadsheet ID berhasil ditautkan: ${cleanId}. Anda dapat mengklik "Tarik Data dari Spreadsheet" untuk memuat data.`,
    });
  };

  // Perform safe sync with user confirmation
  const handleExecuteSync = async () => {
    if (!spreadsheetId) {
      setStatusMessage({ type: 'error', text: 'Belum ada Spreadsheet yang tersambung.' });
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Token otentikasi Google belum siap. Silakan Sign In ulang.' });
      return;
    }

    setIsSyncing(true);
    setStatusMessage(null);
    setConfirmSyncDialog(false);

    try {
      await syncFullClinicDataToSheets(token, spreadsheetId, {
        stockItems,
        transactions,
        expenses,
        branches,
      });

      const now = new Date().toLocaleString('id-ID');
      setLastSyncedAt(now);

      setStatusMessage({
        type: 'success',
        text: `Data ${stockItems.length} obat, ${transactions.length} invoice & ${expenses.length} pengeluaran sukses disimpan ke Google Spreadsheet!`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menyinkronkan data ke Google Sheets.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullData = async () => {
    if (!onLoadDataFromSheets) return;
    setStatusMessage(null);
    try {
      await onLoadDataFromSheets();
      setStatusMessage({
        type: 'success',
        text: 'Berhasil menarik data master stok, transaksi, dan pengeluaran terbaru dari Google Spreadsheet!',
      });
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: e.message || 'Gagal memuat data dari Spreadsheet.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-emerald-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Pusat Database Google Spreadsheet</h3>
              <p className="text-xs text-emerald-100">
                Penyimpanan Cloud Terpusat (Tanpa LocalStorage)
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

        {/* Database Status Strip */}
        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
          <span className="flex items-center gap-1.5 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Database Cloud Terpusat (Google Spreadsheet)
          </span>
          <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
            Realtime
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Step 1: Authentication */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Langkah 1: Akun Google Workspace
            </span>

            {!user ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Hubungkan akun Google Anda untuk memberikan otorisasi aplikasi membaca dan menyimpan database ke Google Drive.
                </p>

                {/* Official Material Styled Sign in with Google Button */}
                <button
                  onClick={handleLogin}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors font-medium text-xs text-slate-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'Menghubungkan Akun...' : 'Sign in with Google'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{user.displayName || 'Pengguna Google'}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Spreadsheet Connection */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Langkah 2: File Spreadsheet Target
            </span>

            {spreadsheetId ? (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Database Cloud Terhubung
                  </span>
                  {spreadsheetUrl && (
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 underline"
                    >
                      <span>Buka Google Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-[11px] text-slate-600 font-mono break-all">
                  ID: {spreadsheetId}
                </div>
                {lastSyncedAt && (
                  <div className="text-[10px] text-slate-500">
                    Terakhir disinkronkan: {lastSyncedAt} WIB
                  </div>
                )}

                {/* Pull Data Button if connected */}
                {onLoadDataFromSheets && (
                  <div className="pt-2 border-t border-emerald-200">
                    <button
                      onClick={handlePullData}
                      disabled={isLoadingFromSheets || !user}
                      className="w-full py-2 px-3 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <DownloadCloud className={`w-3.5 h-3.5 ${isLoadingFromSheets ? 'animate-bounce' : ''}`} />
                      <span>
                        {isLoadingFromSheets
                          ? 'Sedang Membaca Data dari Spreadsheet...'
                          : 'Tarik / Muat Ulang Data dari Google Spreadsheet'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleCreateNewSheet}
                  disabled={!user || isCreating}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {isCreating
                      ? 'Sedang Membuat Database di Google Drive...'
                      : 'Buat Database Spreadsheet Baru Otomatis'}
                  </span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-slate-200"></div>
                  <span className="shrink mx-3 text-[10px] font-semibold text-slate-400 uppercase">
                    atau tautkan ID yang sudah ada
                  </span>
                  <div className="grow border-t border-slate-200"></div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan Spreadsheet ID atau Link URL Google Sheet..."
                    value={customSheetId}
                    onChange={(e) => setCustomSheetId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    onClick={handleConnectExisting}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Tautkan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Sync Actions & Confirmation */}
          {spreadsheetId && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Langkah 3: Sinkronisasi Data Transaksi & Stok
              </span>

              <p className="text-xs text-slate-600">
                Struktur database terbagi rapi ke dalam 5 lembar kerja (sheets):
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-700">
                <div className="p-1.5 bg-white rounded border border-slate-200">1. Ringkasan_Klinik_RCA</div>
                <div className="p-1.5 bg-white rounded border border-slate-200">2. Stock_Opname_RCA</div>
                <div className="p-1.5 bg-white rounded border border-slate-200">3. Pemasukan_Transaksi_RCA</div>
                <div className="p-1.5 bg-white rounded border border-slate-200">4. Pengeluaran_Beban_RCA</div>
                <div className="p-1.5 bg-white rounded border border-slate-200 col-span-2">5. Profil_Cabang_RCA</div>
              </div>

              {confirmSyncDialog ? (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Konfirmasi Pembaruan Spreadsheet
                  </p>
                  <p className="text-xs text-amber-800">
                    Tindakan ini akan memperbarui isi spreadsheet dengan {stockItems.length} produk dan {transactions.length} transaksi saat ini. Lanjutkan sinkronisasi?
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setConfirmSyncDialog(false)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleExecuteSync}
                      disabled={isSyncing}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Menyimpan...' : 'Ya, Simpan ke Spreadsheet'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmSyncDialog(true)}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Simpan & Sinkronkan Data ke Google Sheets</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Izin data hanya untuk spreadsheet yang Anda tautkan
          </span>
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
