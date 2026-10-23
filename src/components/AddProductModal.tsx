import React, { useState } from 'react';
import { PackagePlus, X, DollarSign, Building2, Layers } from 'lucide-react';
import { StockItem } from '../types/clinic';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTypes: string[];
  productBrands: string[];
  onAddProduct: (item: StockItem) => void;
  existingCount: number;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  productTypes,
  productBrands,
  onAddProduct,
  existingCount,
}) => {
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState(productTypes[0] || 'Serum');
  const [merkProduk, setMerkProduk] = useState(productBrands[0] || 'RCA Skincare Premium');
  const [satuan, setSatuan] = useState('Botol');
  const [stockSH, setStockSH] = useState<number>(20);
  const [stockSD, setStockSD] = useState<number>(15);
  const [stockPB, setStockPB] = useState<number>(10);
  const [hargaModal, setHargaModal] = useState<number>(75000);
  const [hargaJual, setHargaJual] = useState<number>(165000);
  const [minThreshold, setMinThreshold] = useState<number>(10);
  const [keterangan, setKeterangan] = useState('Exp: 12/2027 | Batch: RCA-NEW | Simpan suhu ruang 20-25°C');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const totalStock = stockSH + stockSD + stockPB;
    const newItem: StockItem = {
      no: existingCount + 1,
      id: `rca-custom-${Date.now()}`,
      sku: `RCA-${jenis.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      nama,
      jenis,
      merkProduk,
      satuan,
      jumlah: {
        springhill: stockSH,
        sudirman: stockSD,
        'pangkalan-balai': stockPB,
        total: totalStock,
      },
      hargaModal,
      hargaJual,
      keterangan,
      minStockThreshold: minThreshold,
      terakhirOpname: new Date().toISOString().split('T')[0],
    };

    onAddProduct(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        <div className="p-5 bg-gradient-to-r from-rose-600 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <PackagePlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Tambah Produk / Obat Skincare Baru</h3>
              <p className="text-xs text-rose-100">
                Alokasikan stok awal untuk 3 cabang RCA Skincare
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Produk / Obat *
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Hyaluronic Deep Moisture Serum"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Produk</label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                {productTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Merk Produk</label>
              <select
                value={merkProduk}
                onChange={(e) => setMerkProduk(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                {productBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Satuan Kemasan</label>
              <select
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="Botol">Botol</option>
                <option value="Pot">Pot</option>
                <option value="Tube">Tube</option>
                <option value="Vial">Vial</option>
                <option value="Box">Box</option>
                <option value="Pcs">Pcs</option>
              </select>
            </div>
          </div>

          {/* Initial Stock per branch */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="font-bold text-slate-800 block">
              Alokasi Stok Awal per Cabang
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Springhill</label>
                <input
                  type="number"
                  min="0"
                  value={stockSH}
                  onChange={(e) => setStockSH(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Sudirman</label>
                <input
                  type="number"
                  min="0"
                  value={stockSD}
                  onChange={(e) => setStockSD(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Pangkalan Balai</label>
                <input
                  type="number"
                  min="0"
                  value={stockPB}
                  onChange={(e) => setStockPB(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-semibold">
              Total: {stockSH + stockSD + stockPB} {satuan}
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Harga Modal (Rp)
              </label>
              <input
                type="number"
                step="1000"
                value={hargaModal}
                onChange={(e) => setHargaModal(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Harga Jual (Rp)
              </label>
              <input
                type="number"
                step="1000"
                value={hargaJual}
                onChange={(e) => setHargaJual(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batas Min. Stok (Alert)
              </label>
              <input
                type="number"
                min="1"
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseInt(e.target.value, 10) || 10)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Keterangan (Exp Date, Batch, Suhu Simpan)
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs"
            >
              Simpan ke Master Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
