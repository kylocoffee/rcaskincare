import React from 'react';
import {
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Package,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { TimeFilterConfig, TimeFilterPeriod } from '../types/clinic';

interface TimeFilterBarProps {
  filterConfig: TimeFilterConfig;
  onFilterChange: (newConfig: TimeFilterConfig) => void;
  metrics: {
    totalPemasukan: number;
    totalPengeluaran: number;
    arusKasBersih: number;
    stokKeluarQty: number;
    stokMasukQty: number;
    trxCount: number;
  };
  availableMonths?: string[]; // e.g. ['2025-05', '2025-04']
}

export const TimeFilterBar: React.FC<TimeFilterBarProps> = ({
  filterConfig,
  onFilterChange,
  metrics,
  availableMonths = [],
}) => {
  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  const handlePeriodClick = (period: TimeFilterPeriod) => {
    const today = new Date().toISOString().split('T')[0];
    let startDate = today;
    let endDate = today;

    if (period === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      startDate = y.toISOString().split('T')[0];
      endDate = startDate;
    } else if (period === '7_weeks') {
      const past7Weeks = new Date();
      past7Weeks.setDate(past7Weeks.getDate() - 49); // 7 * 7 = 49 days
      startDate = past7Weeks.toISOString().split('T')[0];
      endDate = today;
    } else if (period === 'monthly') {
      // Current month or selected
      const currentMonth = today.substring(0, 7);
      startDate = `${currentMonth}-01`;
      endDate = today;
    }

    onFilterChange({
      ...filterConfig,
      period,
      startDate: period === 'daily_range' ? filterConfig.startDate : startDate,
      endDate: period === 'daily_range' ? filterConfig.endDate : endDate,
    });
  };

  const getMonthLabel = (ym: string) => {
    const [year, month] = ym.split('-');
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${months[mIdx] || month} ${year}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-4">
      {/* Top Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Period Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            Filter Periode:
          </span>

          <button
            onClick={() => handlePeriodClick('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterConfig.period === 'today'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hari Ini
          </button>

          <button
            onClick={() => handlePeriodClick('yesterday')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterConfig.period === 'yesterday'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kemarin
          </button>

          <button
            onClick={() => handlePeriodClick('daily_range')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterConfig.period === 'daily_range'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hari ke Hari (Rentang)
          </button>

          <button
            onClick={() => handlePeriodClick('7_weeks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterConfig.period === '7_weeks'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Per 7 Minggu
          </button>

          <button
            onClick={() => handlePeriodClick('monthly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterConfig.period === 'monthly'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Per Bulan
          </button>

          <button
            onClick={() => handlePeriodClick('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterConfig.period === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
        </div>

        {/* Dynamic Secondary Inputs based on Period */}
        <div className="flex flex-wrap items-center gap-2">
          {filterConfig.period === 'daily_range' && (
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 pl-2">Dari:</span>
              <input
                type="date"
                value={filterConfig.startDate}
                onChange={(e) =>
                  onFilterChange({
                    ...filterConfig,
                    startDate: e.target.value,
                  })
                }
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
              />
              <span className="text-[11px] font-semibold text-slate-500">S/D:</span>
              <input
                type="date"
                value={filterConfig.endDate}
                onChange={(e) =>
                  onFilterChange({
                    ...filterConfig,
                    endDate: e.target.value,
                  })
                }
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
              />
            </div>
          )}

          {filterConfig.period === 'monthly' && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 pl-1">Pilih Bulan:</span>
              <select
                value={filterConfig.selectedMonth}
                onChange={(e) =>
                  onFilterChange({
                    ...filterConfig,
                    selectedMonth: e.target.value,
                  })
                }
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
              >
                {/* Populate from available months or generate recent 12 months */}
                {Array.from(
                  new Set([
                    filterConfig.selectedMonth,
                    ...availableMonths,
                    '2025-05',
                    '2025-04',
                    '2025-03',
                    '2025-02',
                    '2025-01',
                  ])
                )
                  .filter(Boolean)
                  .sort()
                  .reverse()
                  .map((m) => (
                    <option key={m} value={m}>
                      {getMonthLabel(m)}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {filterConfig.period === '7_weeks' && (
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              Rentang: 49 hari terakhir ({filterConfig.startDate} s/d {filterConfig.endDate})
            </span>
          )}
        </div>
      </div>

      {/* Metrics Summary Strip (Pemasukan, Pengeluaran, Arus Kas, Mutasi Stok) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        {/* Pemasukan */}
        <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Pemasukan (Omzet)
            </span>
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base font-black text-emerald-700 mt-1">
            {formatRp(metrics.totalPemasukan)}
          </div>
          <span className="text-[10px] text-emerald-600">
            {metrics.trxCount} transaksi pasien
          </span>
        </div>

        {/* Pengeluaran */}
        <div className="bg-rose-50/70 border border-rose-100 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Pengeluaran (Beban)
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-base font-black text-rose-700 mt-1">
            {formatRp(metrics.totalPengeluaran)}
          </div>
          <span className="text-[10px] text-rose-600">
            Biaya operasional & medis
          </span>
        </div>

        {/* Arus Kas Bersih */}
        <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
              Arus Kas Bersih
            </span>
            <DollarSign className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-base font-black text-blue-800 mt-1">
            {formatRp(metrics.arusKasBersih)}
          </div>
          <span className="text-[10px] text-blue-600">
            {metrics.arusKasBersih >= 0 ? 'Surplus Operasional' : 'Defisit Operasional'}
          </span>
        </div>

        {/* Mutasi Stok Masuk & Keluar */}
        <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
              Mutasi Stok Obat
            </span>
            <Package className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-2">
            <span className="text-rose-600 font-black">
              -{metrics.stokKeluarQty} Terjual
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-black">
              +{metrics.stokMasukQty} Masuk
            </span>
          </div>
          <span className="text-[10px] text-purple-700">
            Pemakaian resep & obat klinik
          </span>
        </div>
      </div>
    </div>
  );
};
