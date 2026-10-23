import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Building2,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  BrainCircuit,
} from 'lucide-react';
import { StockItem, Transaction, FilterBranchId } from '../types/clinic';
import { BRANCHES } from '../data/initialData';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBranch: FilterBranchId;
  stockItems: StockItem[];
  transactions: Transaction[];
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  selectedBranch,
  stockItems,
  transactions,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateAdvice = async (customQ?: string) => {
    setLoading(true);
    setAnalysisResult(null);

    const activeQuestion = customQ || question;

    // Summarize sales by branch
    const salesSummary = BRANCHES.map((b) => {
      const bTrx = transactions.filter((t) => t.branch === b.id);
      const bOmzet = bTrx.reduce((acc, t) => acc + t.total, 0);
      return {
        cabang: b.name,
        totalTransaksi: bTrx.length,
        totalOmzet: bOmzet,
      };
    });

    // Sample stock with low stock alerts
    const stockSummary = stockItems.map((s) => ({
      nama: s.nama,
      jenis: s.jenis,
      merk: s.merkProduk,
      stokSpringhill: s.jumlah.springhill,
      stokSudirman: s.jumlah.sudirman,
      stokPangkalanBalai: s.jumlah['pangkalan-balai'],
      hargaModal: s.hargaModal,
      hargaJual: s.hargaJual,
      isMenipis:
        s.jumlah.springhill <= s.minStockThreshold ||
        s.jumlah.sudirman <= s.minStockThreshold ||
        s.jumlah['pangkalan-balai'] <= s.minStockThreshold,
    }));

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: selectedBranch === 'all' ? 'Semua Cabang' : BRANCHES.find((b) => b.id === selectedBranch)?.name,
          stockData: stockSummary,
          salesSummary,
          customQuestion: activeQuestion,
        }),
      });

      const data = await res.json();
      if (data.success && data.advice) {
        setAnalysisResult(data.advice);
      } else {
        setAnalysisResult(data.error || 'Gagal memuat rekomendasi AI.');
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisResult(`Koneksi server gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-purple-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">AI Clinic & Inventory Intelligence</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/50 border border-purple-300 text-purple-100">
                  Thinking Mode: HIGH
                </span>
              </div>
              <p className="text-xs text-purple-200">
                Didukung model reasoning mendalam Gemini untuk optimasi bisnis RCA Skincare
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
          {/* Quick preset prompts */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-700 block">Pilih Topik Analisis Cepat:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setQuestion('Evaluasi performa 3 cabang dan saran rebalancing stok menipis');
                  handleGenerateAdvice('Evaluasi performa 3 cabang dan saran rebalancing stok menipis');
                }}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-semibold transition-colors flex items-center gap-1"
              >
                <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                <span>Analisis Komparasi 3 Cabang</span>
              </button>
              <button
                onClick={() => {
                  setQuestion('Rekomendasi kuantitas restock (PO) untuk obat & skincare yang menipis');
                  handleGenerateAdvice('Rekomendasi kuantitas restock (PO) untuk obat & skincare yang menipis');
                }}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-semibold transition-colors flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Rencana Restock Obat Kritis</span>
              </button>
              <button
                onClick={() => {
                  setQuestion('Ide paket promo bundling treatment dan skincare untuk mendongkrak omzet');
                  handleGenerateAdvice('Ide paket promo bundling treatment dan skincare untuk mendongkrak omzet');
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold transition-colors flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5 text-rose-600" />
                <span>Ide Bundling Treatment</span>
              </button>
            </div>
          </div>

          {/* Custom Question input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Tulis pertanyaan analitik khusus Anda di sini..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateAdvice();
              }}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <button
              onClick={() => handleGenerateAdvice()}
              disabled={loading}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Menganalisis...' : 'Kirim'}</span>
            </button>
          </div>

          {/* Results display */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="relative w-12 h-12 mx-auto">
                <BrainCircuit className="w-12 h-12 text-purple-600 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Gemini sedang melakukan penalaran mendalam (Thinking Level HIGH)...
                </p>
                <p className="text-slate-400 text-xs">
                  Mengevaluasi omzet, perputaran obat, dan korelasi stok di Springhill, Sudirman, dan Pangkalan Balai
                </p>
              </div>
            </div>
          )}

          {analysisResult && !loading && (
            <div className="p-5 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-3 mt-4 leading-relaxed whitespace-pre-line text-slate-800 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-purple-200/60 font-bold text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Hasil Analisis & Rekomendasi Konsultan AI</span>
              </div>
              <div className="prose prose-purple max-w-none text-slate-800 text-xs">
                {analysisResult}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>AI dilatih pada data rekam klinik kecantikan & inventory management</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
