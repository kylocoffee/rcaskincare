import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  X,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  Copy,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.href;

  useEffect(() => {
    // Detect if already installed in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'Untuk memasang aplikasi ini di Android:\n\n1. Buka tautan ini di browser Google Chrome HP Anda\n2. Tekan menu titik tiga (⋮) di pojok kanan atas\n3. Pilih "Tambahkan ke Layar Utama" atau "Install Aplikasi"'
      );
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadManifestPackage = () => {
    const pkg = {
      app: 'RCA Skincare Clinic ERP',
      package: 'com.rcaskincare.clinicapp',
      version: '2.4.0',
      pwaUrl: appUrl,
      manifestUrl: `${window.location.origin}/manifest.webmanifest`,
      instructions:
        'Aplikasi ini adalah Progressive Web APK yang dapat dipasang langsung di HP Android via Chrome tanpa perlu download file APK manual yang berisiko virus.',
    };
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pkg, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'RCA_Skincare_Android_Package.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-rose-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Unduh APK & Pasang di HP Android / iOS</h3>
              <p className="text-xs text-rose-100">
                Akses cepat kasir & stok klinik RCA Skincare langsung dari layar smartphone
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          {/* Main 1-Click Install Button */}
          <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-md mx-auto flex items-center justify-center border border-rose-100">
              <Smartphone className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                RCA Skincare Mobile APK (Web App)
              </h4>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Ringan, instan, otomatis sinkron cloud, dan tidak menghabiskan memori HP.
              </p>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>
                {deferredPrompt ? 'Pasang Sekarang ke HP Android' : 'Instal Aplikasi ke Layar HP'}
              </span>
            </button>
          </div>

          {/* Tutorial Step-by-Step for Android */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">
                🤖
              </span>
              Panduan Pasang di HP Android (Google Chrome):
            </span>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-700">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>Buka tautan sistem RCA Skincare di browser <strong>Google Chrome</strong> pada HP Anda.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>Tekan tombol <strong>Menu Titik Tiga (⋮)</strong> di pojok kanan atas browser Chrome.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>Pilih opsi <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  4
                </span>
                <span>Aplikasi akan otomatis muncul di menu aplikasi HP Android Anda layaknya APK native!</span>
              </div>
            </div>
          </div>

          {/* Tutorial for iPhone */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px]">
                🍎
              </span>
              Panduan Pasang di iPhone / iPad (Safari):
            </span>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-700">
              <p>1. Buka tautan ini di browser <strong>Safari</strong> iPhone.</p>
              <p>2. Tekan tombol <strong>Bagikan (Share icon kotak panah ke atas)</strong> di bilah bawah.</p>
              <p>3. Gulir ke bawah lalu pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</p>
            </div>
          </div>

          {/* Share / Copy Link */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
            <div className="truncate flex-1">
              <span className="text-[10px] text-slate-400 block font-semibold">Tautan Aplikasi untuk HP:</span>
              <span className="text-xs font-mono text-slate-800 truncate block">{appUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shrink-0 transition-colors flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>

          {/* Download Config Package */}
          <div className="pt-1 text-center">
            <button
              onClick={handleDownloadManifestPackage}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
            >
              Unduh Berkas Konfigurasi Android Package (.json)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Terverifikasi Aman & Bebas Iklan
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
