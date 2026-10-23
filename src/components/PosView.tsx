import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Phone,
  FileText,
  CreditCard,
  DollarSign,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  Tag,
  Stethoscope,
  Lock,
} from 'lucide-react';
import {
  StockItem,
  Transaction,
  BranchId,
  FilterBranchId,
  BranchInfo,
  PaymentMethod,
  TransactionCategory,
  TransactionItem,
} from '../types/clinic';

interface PosViewProps {
  stockItems: StockItem[];
  branches: BranchInfo[];
  selectedBranch: FilterBranchId;
  setSelectedBranch: (branch: FilterBranchId) => void;
  onSubmitTransaction: (trx: Transaction) => void;
}

interface CartItem extends TransactionItem {
  maxStock: number;
  sku: string;
}

export const PosView: React.FC<PosViewProps> = ({
  stockItems,
  branches,
  selectedBranch,
  setSelectedBranch,
  onSubmitTransaction,
}) => {
  // CRITICAL REQUIREMENT: Branch selection must be a dropdown with Default: 'NONE'
  // When 'NONE', transactions CANNOT be executed to prevent hurried mistakes!
  const [posBranch, setPosBranch] = useState<BranchId | 'NONE'>('NONE');

  const currentBranchInfo = branches.find((b) => b.id === posBranch) || null;

  // Mobile Tab toggle between Catalog and Cart
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Search & Filter in Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Patient / Transaction Header State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [medicalRecordNo, setMedicalRecordNo] = useState(() => {
    return 'RM-' + Math.floor(100000 + Math.random() * 900000);
  });
  const [attendingDoctor, setAttendingDoctor] = useState(
    currentBranchInfo ? currentBranchInfo.headDoctor : 'Pilih Dokter...'
  );
  const [category, setCategory] = useState<TransactionCategory>('Resep Obat & Skincare');
  const [notes, setNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [discountNominal, setDiscountNominal] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number | ''>('');

  // Categories list derived from stockItems
  const categories = useMemo(() => {
    const list = Array.from(new Set(stockItems.map((i) => i.jenis)));
    return ['all', ...list];
  }, [stockItems]);

  // Keep attending doctor in sync when branch changes
  React.useEffect(() => {
    if (currentBranchInfo) {
      setAttendingDoctor(currentBranchInfo.headDoctor);
    } else {
      setAttendingDoctor('');
    }
  }, [currentBranchInfo]);

  // Filtered Products Catalog
  const filteredProducts = useMemo(() => {
    return stockItems.filter((item) => {
      if (selectedCategory !== 'all' && item.jenis !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          item.nama.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.merkProduk.toLowerCase().includes(q) ||
          item.jenis.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [stockItems, selectedCategory, searchQuery]);

  // Add Item to Cart
  const handleAddToCart = (product: StockItem) => {
    // ENFORCE: Branch cannot be NONE
    if (posBranch === 'NONE') {
      alert('⚠️ PERHATIAN KASIR: Silakan pilih cabang klinik terlebih dahulu pada dropdown di atas sebelum memilih produk!');
      return;
    }

    const branchStock = product.jumlah[posBranch] ?? 0;
    if (branchStock <= 0) {
      alert(`Stok ${product.nama} habis di cabang ${currentBranchInfo?.name || posBranch}!`);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.itemId === product.id);
      if (existing) {
        if (existing.qty >= branchStock) {
          alert(`Kuantitas melebihi stok yang tersedia (${branchStock} ${product.satuan}) di cabang ini.`);
          return prev;
        }
        return prev.map((ci) =>
          ci.itemId === product.id
            ? {
                ...ci,
                qty: ci.qty + 1,
                subtotal: (ci.qty + 1) * ci.hargaSatuan,
              }
            : ci
        );
      } else {
        return [
          ...prev,
          {
            itemId: product.id,
            sku: product.sku,
            nama: product.nama,
            qty: 1,
            hargaSatuan: product.hargaJual,
            subtotal: product.hargaJual,
            isSkincareProduct: true,
            maxStock: branchStock,
          },
        ];
      }
    });
  };

  // Add Ad-hoc Treatment / Tindakan Medis (Non-physical stock)
  const handleAddTreatment = (namaTreatment: string, harga: number) => {
    // ENFORCE: Branch cannot be NONE
    if (posBranch === 'NONE') {
      alert('⚠️ PERHATIAN KASIR: Silakan pilih cabang klinik terlebih dahulu pada dropdown di atas sebelum menambahkan tindakan medis!');
      return;
    }

    const customId = 'trx-tindakan-' + Date.now();
    setCartItems((prev) => [
      ...prev,
      {
        itemId: customId,
        sku: 'TRT-MED',
        nama: namaTreatment,
        qty: 1,
        hargaSatuan: harga,
        subtotal: harga,
        isSkincareProduct: false,
        maxStock: 9999,
      },
    ]);
  };

  // Change Quantity in Cart
  const handleUpdateQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          if (newQty > item.maxStock) {
            alert(`Maksimal stok tersedia di cabang ini adalah ${item.maxStock}.`);
            return item;
          }
          return {
            ...item,
            qty: newQty,
            subtotal: newQty * item.hargaSatuan,
          };
        }
        return item;
      })
    );
  };

  // Remove Item from Cart
  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const total = Math.max(0, subtotal - (discountNominal || 0));
  const changeAmount = typeof cashTendered === 'number' ? Math.max(0, cashTendered - total) : 0;
  const isCashInsufficient =
    paymentMethod === 'Tunai' &&
    typeof cashTendered === 'number' &&
    cashTendered > 0 &&
    cashTendered < total;

  const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  // Execute Checkout with Strict Branch Validation
  const handleCheckout = () => {
    // 1. STRICT VALIDATION: Branch MUST NOT BE NONE
    if (posBranch === 'NONE' || !currentBranchInfo) {
      alert(
        '⚠️ TRANSAKSI DITOLAK!\n\nKasir belum memilih cabang klinik (Status: NONE).\nSilakan pilih cabang klinik pada dropdown terlebih dahulu untuk menghindari salah penggunaan cabang atau salah potong stok!'
      );
      return;
    }

    if (cartItems.length === 0) {
      alert('Keranjang belanja masih kosong! Silakan pilih produk atau tindakan medis terlebih dahulu.');
      return;
    }

    if (!patientName.trim()) {
      alert('Mohon isi Nama Pasien terlebih dahulu.');
      return;
    }

    if (paymentMethod === 'Tunai' && typeof cashTendered === 'number' && cashTendered < total) {
      alert('Uang tunai yang diterima kurang dari total pembayaran!');
      return;
    }

    // Generate Invoice ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `INV-${dateStr}-${randomSuffix}`;

    const newTransaction: Transaction = {
      id: invoiceId,
      branch: posBranch,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || '08xxxxxxxxxx',
      medicalRecordNo: medicalRecordNo.trim(),
      attendingDoctor: attendingDoctor.trim() || currentBranchInfo.headDoctor,
      category,
      items: cartItems.map((ci) => ({
        itemId: ci.itemId,
        nama: ci.nama,
        qty: ci.qty,
        hargaSatuan: ci.hargaSatuan,
        subtotal: ci.subtotal,
        isSkincareProduct: ci.isSkincareProduct,
      })),
      subtotal,
      discount: discountNominal || 0,
      tax: 0,
      total,
      paymentMethod,
      paymentStatus: 'Lunas',
      notes: notes.trim(),
    };

    onSubmitTransaction(newTransaction);

    // Reset Form for next customer
    setCartItems([]);
    setPatientName('');
    setPatientPhone('');
    setMedicalRecordNo('RM-' + Math.floor(100000 + Math.random() * 900000));
    setDiscountNominal(0);
    setCashTendered('');
    setNotes('');
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Top POS Header & Simple Branch Dropdown */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Kasir POS Penjualan
            </h2>
            <p className="text-[11px] text-slate-500">
              {posBranch === 'NONE'
                ? 'Pilih cabang klinik untuk memuat stok'
                : `Cabang aktif: ${currentBranchInfo?.name}`}
            </p>
          </div>
        </div>

        {/* Clean Dropdown Cabang */}
        <div className="flex items-center gap-2">
          <select
            id="pos-branch-dropdown"
            value={posBranch}
            onChange={(e) => {
              const val = e.target.value as BranchId | 'NONE';
              setPosBranch(val);
              if (val !== 'NONE') {
                setSelectedBranch(val);
              }
            }}
            className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none ${
              posBranch === 'NONE'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-white'
            }`}
          >
            <option value="NONE">-- Pilih Cabang Klinik --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden bg-slate-200/80 p-1 rounded-xl">
        <button
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'catalog'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          Katalog Obat &amp; Treatment
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative ${
            mobileTab === 'cart'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          <span>Keranjang Pembayaran</span>
          {cartItems.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Main POS Grid (Left: Catalog, Right: Cart & Checkout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: CATALOG (7 of 12 cols on desktop) */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileTab === 'cart' ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Search & Treatment Quick Buttons */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari obat, serum, sunscreen, tindakan laser, atau SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? '✨ Semua Produk' : cat}
                </button>
              ))}
            </div>

            {/* Quick Treatment / Tindakan Non-Stok Presets */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                + Tindakan Kilat:
              </span>
              <button
                type="button"
                onClick={() => handleAddTreatment('Laser Q-Switched Melasma', 450000)}
                disabled={posBranch === 'NONE'}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
              >
                + Laser Melasma (450rb)
              </button>
              <button
                type="button"
                onClick={() => handleAddTreatment('Acne Facial Glow Therapy', 250000)}
                disabled={posBranch === 'NONE'}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
              >
                + Facial Acne (250rb)
              </button>
              <button
                type="button"
                onClick={() => handleAddTreatment('Konsultasi Dokter Spesialis Kulit', 150000)}
                disabled={posBranch === 'NONE'}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
              >
                + Konsul Dokter (150rb)
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Tidak ada produk yang cocok dengan pencarian "{searchQuery}".
              </div>
            ) : (
              filteredProducts.map((product) => {
                const stockInBranch =
                  posBranch !== 'NONE' ? product.jumlah[posBranch] ?? 0 : 0;
                const isOutOfStock = posBranch !== 'NONE' && stockInBranch <= 0;
                const isLow = posBranch !== 'NONE' && stockInBranch <= product.minStockThreshold;

                // Check how many currently in cart
                const inCart = cartItems.find((ci) => ci.itemId === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (posBranch === 'NONE') {
                        alert('⚠️ Silakan pilih cabang klinik pada dropdown di atas terlebih dahulu!');
                        return;
                      }
                      if (!isOutOfStock) handleAddToCart(product);
                    }}
                    className={`bg-white rounded-2xl p-3.5 border transition-all flex flex-col justify-between relative group select-none ${
                      posBranch === 'NONE'
                        ? 'border-amber-200/80 bg-amber-50/20 cursor-pointer hover:border-amber-400'
                        : isOutOfStock
                        ? 'opacity-60 border-slate-200 cursor-not-allowed bg-slate-50/50'
                        : 'border-slate-200/90 hover:border-rose-400 hover:shadow-md cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {product.sku}
                      </span>
                      {posBranch === 'NONE' ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          PILIH CABANG
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOutOfStock ? 'HABIS' : `Stok: ${stockInBranch}`}
                        </span>
                      )}
                    </div>

                    {/* Product Name & Brand */}
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                        {product.nama}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {product.jenis} • {product.merkProduk}
                      </div>
                    </div>

                    {/* Price & Add Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="font-black text-rose-600 text-xs">
                        {formatRp(product.hargaJual)}
                      </div>

                      <div className="flex items-center gap-1">
                        {inCart && (
                          <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                            {inCart.qty}
                          </span>
                        )}
                        <button
                          disabled={posBranch !== 'NONE' && isOutOfStock}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                            posBranch === 'NONE'
                              ? 'bg-amber-100 text-amber-700'
                              : isOutOfStock
                              ? 'bg-slate-200 text-slate-400'
                              : 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CART & CHECKOUT (5 of 12 cols on desktop) */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            mobileTab === 'catalog' ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md space-y-4">
            {/* Header: Patient Profile Inputs */}
            <div className="pb-3 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-rose-600" />
                  Identitas Pasien &amp; Resep
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {medicalRecordNo}
                </span>
              </div>

              {/* Branch indicator in checkout */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium">Cabang Kasir:</span>
                <span className={`font-semibold ${posBranch === 'NONE' ? 'text-slate-400 italic' : 'text-slate-900 font-bold'}`}>
                  {posBranch === 'NONE' ? 'Belum Dipilih' : currentBranchInfo?.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Nama Pasien *"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="No. WA Pasien"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mb-1">
                    <Stethoscope className="w-3 h-3 text-rose-500" />
                    Dokter Penanggung Jawab:
                  </div>
                  <input
                    type="text"
                    value={attendingDoctor}
                    onChange={(e) => setAttendingDoctor(e.target.value)}
                    placeholder="Nama Dokter..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 mb-1">
                    Kategori Transaksi:
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="Resep Obat & Skincare">Resep Obat &amp; Skincare</option>
                    <option value="Treatment">Tindakan Medis / Laser</option>
                    <option value="Paket Bundling">Paket Bundling Glowing</option>
                    <option value="Konsultasi Dokter">Konsultasi Dokter</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Rincian Item ({cartItems.length})</span>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCartItems([])}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Kosongkan
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                {cartItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    Belum ada obat atau tindakan yang dipilih.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.itemId}
                      className="pt-2 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1 truncate">
                        <div className="font-semibold text-slate-900 truncate">
                          {item.nama}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatRp(item.hargaSatuan)} / pcs
                        </div>
                      </div>

                      {/* Stepper Quantity */}
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                        <button
                          onClick={() => handleUpdateQty(item.itemId, item.qty - 1)}
                          className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900 text-xs">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.itemId, item.qty + 1)}
                          className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Subtotal */}
                      <div className="w-20 text-right font-bold text-slate-800">
                        {formatRp(item.subtotal)}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemoveItem(item.itemId)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Discount Box */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Penjualan:</span>
                <span className="font-semibold">{formatRp(subtotal)}</span>
              </div>

              {/* Diskon Input */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Diskon / Potongan (Rp):</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={discountNominal || ''}
                  onChange={(e) => setDiscountNominal(Number(e.target.value) || 0)}
                  className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-semibold text-rose-600 focus:outline-none"
                />
              </div>

              {/* Grand Total */}
              <div className="p-3 bg-gradient-to-r from-slate-900 to-rose-950 text-white rounded-2xl flex items-center justify-between shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-200">
                  Total Bayar Pasien
                </span>
                <span className="text-xl font-black">{formatRp(total)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-700 block">
                Metode Pembayaran:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['QRIS', 'Tunai', 'Transfer BCA', 'Transfer Mandiri', 'Debit/Kredit'] as PaymentMethod[]).map(
                  (method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        paymentMethod === method
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Cash Calculator (If Tunai) */}
            {paymentMethod === 'Tunai' && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-900">Uang Diterima Pasien:</span>
                  <input
                    type="number"
                    placeholder="Nominal uang..."
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value ? Number(e.target.value) : '')}
                    className="w-32 px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-right font-bold text-slate-900"
                  />
                </div>

                {/* Quick Cash Buttons */}
                <div className="flex items-center gap-1 justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCashTendered(total)}
                    className="px-2 py-0.5 bg-white border border-amber-300 rounded text-[10px] font-bold text-amber-800"
                  >
                    Uang Pas
                  </button>
                  {[50000, 100000, 200000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(amt)}
                      className="px-2 py-0.5 bg-white border border-amber-300 rounded text-[10px] font-medium text-slate-700"
                    >
                      {amt / 1000}rb
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-1 border-t border-amber-200/60 font-bold">
                  <span className="text-amber-900">Uang Kembalian:</span>
                  <span className={`text-sm ${isCashInsufficient ? 'text-rose-600' : 'text-emerald-700 font-black'}`}>
                    {isCashInsufficient
                      ? `Kurang ${formatRp(total - (cashTendered || 0))}`
                      : formatRp(changeAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Checkout Button - Disabled if posBranch === 'NONE' */}
            <button
              onClick={handleCheckout}
              disabled={posBranch === 'NONE' || cartItems.length === 0}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                posBranch === 'NONE'
                  ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed shadow-none'
                  : cartItems.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-rose-200 active:scale-98'
              }`}
            >
              {posBranch === 'NONE' ? (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Pilih Cabang Terlebih Dahulu</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Proses Bayar &amp; Cetak Struk PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
