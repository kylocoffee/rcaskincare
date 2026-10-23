/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StockOpnameView } from './components/StockOpnameView';
import { TransactionsView } from './components/TransactionsView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { LowStockAlertModal } from './components/LowStockAlertModal';
import { StockOpnameModal } from './components/StockOpnameModal';
import { StockTransferModal } from './components/StockTransferModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { AddProductModal } from './components/AddProductModal';
import { EditProductModal } from './components/EditProductModal';
import { EditTransactionModal } from './components/EditTransactionModal';
import { ExpenseModal } from './components/ExpenseModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { DocumentationModal } from './components/DocumentationModal';
import { DownloadApkModal } from './components/DownloadApkModal';
import { MonthlyResetModal } from './components/MonthlyResetModal';
import { PosView } from './components/PosView';
import { EditBranchModal } from './components/EditBranchModal';

import {
  StockItem,
  Transaction,
  Expense,
  FilterBranchId,
  BranchId,
  BranchInfo,
  StockOpnameRecord,
  StockTransferRecord,
  ClinicBackupData,
} from './types/clinic';
import {
  INITIAL_STOCK_ITEMS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_PRODUCT_TYPES,
  INITIAL_PRODUCT_BRANDS,
  BRANCHES,
} from './data/initialData';
import { exportStockOpnameToExcel, exportTransactionsToExcel } from './services/excelExportService';
import { initAuth, setAccessTokenInMemory, getAccessToken } from './services/firebaseAuth';
import { fetchClinicDataFromSheets, syncFullClinicDataToSheets } from './services/sheetsService';

export default function App() {
  // Navigation & Branch State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'pos' | 'stock' | 'transactions' | 'admin'>('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<FilterBranchId>('all');

  // In-memory Core Business Data (Strictly NO localStorage for database records)
  // All business records live in Google Spreadsheet as the central database
  const [stockItems, setStockItems] = useState<StockItem[]>(INITIAL_STOCK_ITEMS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [productTypes, setProductTypes] = useState<string[]>(INITIAL_PRODUCT_TYPES);
  const [productBrands, setProductBrands] = useState<string[]>(INITIAL_PRODUCT_BRANDS);
  const [branches, setBranches] = useState<BranchInfo[]>(BRANCHES);

  const [branchToEdit, setBranchToEdit] = useState<BranchInfo | null>(null);

  // Google Sheets Cloud Database State
  const [user, setUser] = useState<User | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return sessionStorage.getItem('rca_active_sheet_id') || null;
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    return sessionStorage.getItem('rca_active_sheet_url') || null;
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isLoadingFromSheets, setIsLoadingFromSheets] = useState(false);

  // Modals state
  const [isLowStockOpen, setIsLowStockOpen] = useState(false);
  const [isStockOpnameOpen, setIsStockOpnameOpen] = useState(false);
  const [opnameTargetItem, setOpnameTargetItem] = useState<StockItem | null>(null);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferTargetItem, setTransferTargetItem] = useState<StockItem | null>(null);
  const [transferTargetBranch, setTransferTargetBranch] = useState<BranchId | undefined>(undefined);

  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [invoiceModalTrx, setInvoiceModalTrx] = useState<Transaction | null>(null);

  // Edit / Delete Modals State
  const [productToEdit, setProductToEdit] = useState<StockItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<StockItem | null>(null);

  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [revertStockOnDeleteTrx, setRevertStockOnDeleteTrx] = useState<boolean>(true);

  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // APK & Monthly Reset Modal States
  const [isDownloadApkOpen, setIsDownloadApkOpen] = useState(false);
  const [isMonthlyResetOpen, setIsMonthlyResetOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string>('rca2026');

  // Enforce removal of any legacy business data in localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('rca_skincare_stock');
      localStorage.removeItem('rca_skincare_transactions');
      localStorage.removeItem('rca_skincare_expenses');
      localStorage.removeItem('rca_product_types');
      localStorage.removeItem('rca_product_brands');
      localStorage.removeItem('rca_branches');
      localStorage.removeItem('rca_admin_password');
    } catch (e) {
      console.warn('LocalStorage cleanup:', e);
    }
  }, []);

  // Save session sheet pointers
  useEffect(() => {
    if (spreadsheetId) sessionStorage.setItem('rca_active_sheet_id', spreadsheetId);
    if (spreadsheetUrl) sessionStorage.setItem('rca_active_sheet_url', spreadsheetUrl);
  }, [spreadsheetId, spreadsheetUrl]);

  // Load clinic data directly from Google Spreadsheet
  const handleLoadFromSheets = useCallback(async () => {
    if (!spreadsheetId) {
      throw new Error('Belum ada Spreadsheet ID yang tertaut.');
    }
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Sesi Google belum aktif. Silakan login terlebih dahulu.');
    }

    setIsLoadingFromSheets(true);
    try {
      const data = await fetchClinicDataFromSheets(token, spreadsheetId);
      if (data.stockItems && data.stockItems.length > 0) {
        setStockItems(data.stockItems);
      }
      if (data.transactions && data.transactions.length > 0) {
        setTransactions(data.transactions);
      }
      if (data.expenses && data.expenses.length > 0) {
        setExpenses(data.expenses);
      }
      if (data.branches && data.branches.length > 0) {
        setBranches(data.branches);
      }

      const now = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setLastSyncedAt(now);
    } finally {
      setIsLoadingFromSheets(false);
    }
  }, [spreadsheetId]);

  // Auto-sync data back to Google Sheets whenever actions are performed
  const triggerAutoSync = useCallback(
    async (
      overrideStock?: StockItem[],
      overrideTrx?: Transaction[],
      overrideExp?: Expense[],
      overrideBranches?: BranchInfo[]
    ) => {
      if (!spreadsheetId) return;
      const token = await getAccessToken();
      if (!token) return;

      try {
        await syncFullClinicDataToSheets(token, spreadsheetId, {
          stockItems: overrideStock || stockItems,
          transactions: overrideTrx || transactions,
          expenses: overrideExp || expenses,
          branches: overrideBranches || branches,
        });
        const now = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setLastSyncedAt(now);
      } catch (err) {
        console.warn('Auto-sync to Google Sheets failed:', err);
      }
    },
    [spreadsheetId, stockItems, transactions, expenses, branches]
  );

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessTokenInMemory(token);
      },
      () => {
        // Not authenticated
      }
    );
    return () => unsubscribe();
  }, []);

  // Handler: New Transaction Submitted -> Auto deduct stock and persist to Google Sheets!
  const handleSubmitTransaction = (trx: Transaction) => {
    // 1. Deduct stock for each skincare item from the selected branch
    const updatedStock = stockItems.map((item) => {
      const totalQty = trx.items
        .filter((i) => i.itemId === item.id && i.isSkincareProduct)
        .reduce((sum, i) => sum + i.qty, 0);

      if (totalQty > 0) {
        const currentBranchQty = item.jumlah[trx.branch] ?? 0;
        const newBranchQty = Math.max(0, currentBranchQty - totalQty);
        const sh = trx.branch === 'springhill' ? newBranchQty : item.jumlah.springhill;
        const sd = trx.branch === 'sudirman' ? newBranchQty : item.jumlah.sudirman;
        const pb = trx.branch === 'pangkalan-balai' ? newBranchQty : item.jumlah['pangkalan-balai'];

        return {
          ...item,
          jumlah: {
            ...item.jumlah,
            [trx.branch]: newBranchQty,
            total: sh + sd + pb,
          },
        };
      }
      return item;
    });

    const updatedTrx = [trx, ...transactions];

    setStockItems(updatedStock);
    setTransactions(updatedTrx);

    // 2. Open invoice preview automatically with print, download & WhatsApp share options
    setInvoiceModalTrx(trx);

    // 3. Auto-save directly into Google Spreadsheet Cloud Database
    triggerAutoSync(updatedStock, updatedTrx);
  };

  // Handler: Save Edited Transaction
  const handleSaveTransaction = (updated: Transaction) => {
    const updatedList = transactions.map((t) => (t.id === updated.id ? updated : t));
    setTransactions(updatedList);
    setTransactionToEdit(null);
    triggerAutoSync(undefined, updatedList);
  };

  // Handler: Delete Transaction with optional stock reversal
  const handleConfirmDeleteTransaction = () => {
    if (!transactionToDelete) return;

    let updatedStock = stockItems;
    if (revertStockOnDeleteTrx) {
      updatedStock = stockItems.map((item) => {
        const totalRevertQty = transactionToDelete.items
          .filter((i) => i.itemId === item.id && i.isSkincareProduct)
          .reduce((sum, i) => sum + i.qty, 0);

        if (totalRevertQty > 0) {
          const currentBranchQty = item.jumlah[transactionToDelete.branch] ?? 0;
          const newBranchQty = currentBranchQty + totalRevertQty;
          const sh = transactionToDelete.branch === 'springhill' ? newBranchQty : item.jumlah.springhill;
          const sd = transactionToDelete.branch === 'sudirman' ? newBranchQty : item.jumlah.sudirman;
          const pb = transactionToDelete.branch === 'pangkalan-balai' ? newBranchQty : item.jumlah['pangkalan-balai'];

          return {
            ...item,
            jumlah: {
              ...item.jumlah,
              [transactionToDelete.branch]: newBranchQty,
              total: sh + sd + pb,
            },
          };
        }
        return item;
      });
      setStockItems(updatedStock);
    }

    const updatedTrx = transactions.filter((t) => t.id !== transactionToDelete.id);
    setTransactions(updatedTrx);
    setTransactionToDelete(null);
    triggerAutoSync(updatedStock, updatedTrx);
  };

  // Handler: Save Edited Product
  const handleSaveProduct = (updated: StockItem) => {
    const total =
      (updated.jumlah.springhill || 0) +
      (updated.jumlah.sudirman || 0) +
      (updated.jumlah['pangkalan-balai'] || 0);

    const sanitized: StockItem = {
      ...updated,
      jumlah: {
        ...updated.jumlah,
        total,
      },
    };
    const updatedStock = stockItems.map((p) => (p.id === sanitized.id ? sanitized : p));
    setStockItems(updatedStock);
    setProductToEdit(null);
    triggerAutoSync(updatedStock);
  };

  // Handler: Save Edited Branch Profile / Penanggung Jawab
  const handleSaveBranch = (updated: BranchInfo) => {
    const updatedBranches = branches.map((b) => (b.id === updated.id ? updated : b));
    setBranches(updatedBranches);
    setBranchToEdit(null);
    triggerAutoSync(undefined, undefined, undefined, updatedBranches);
  };

  // Handler: Delete Product
  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    const updatedStock = stockItems.filter((p) => p.id !== productToDelete.id);
    setStockItems(updatedStock);
    setProductToDelete(null);
    triggerAutoSync(updatedStock);
  };

  // Handler: Save Expense
  const handleSaveExpense = (savedExpense: Expense) => {
    let updatedExpenses: Expense[] = [];
    setExpenses((prev) => {
      const exists = prev.some((e) => e.id === savedExpense.id);
      if (exists) {
        updatedExpenses = prev.map((e) => (e.id === savedExpense.id ? savedExpense : e));
      } else {
        updatedExpenses = [savedExpense, ...prev];
      }
      return updatedExpenses;
    });
    setExpenseToEdit(null);
    setIsExpenseModalOpen(false);
    triggerAutoSync(undefined, undefined, updatedExpenses);
  };

  // Handler: Delete Expense
  const handleConfirmDeleteExpense = () => {
    if (!expenseToDelete) return;
    const updatedExpenses = expenses.filter((e) => e.id !== expenseToDelete.id);
    setExpenses(updatedExpenses);
    setExpenseToDelete(null);
    triggerAutoSync(undefined, undefined, updatedExpenses);
  };

  // Master Data: Add, Edit, Delete Product Types
  const handleAddProductType = (name: string) => {
    if (productTypes.includes(name)) {
      alert(`Jenis "${name}" sudah ada.`);
      return;
    }
    setProductTypes((prev) => [...prev, name]);
  };

  const handleEditProductType = (oldName: string, newName: string) => {
    setProductTypes((prev) => prev.map((t) => (t === oldName ? newName : t)));
    setStockItems((prev) =>
      prev.map((item) => (item.jenis === oldName ? { ...item, jenis: newName } : item))
    );
  };

  const handleDeleteProductType = (name: string) => {
    const isUsed = stockItems.some((i) => i.jenis === name);
    if (isUsed) {
      if (
        !confirm(
          `Jenis "${name}" sedang digunakan oleh beberapa produk. Jika dihapus, produk tersebut akan dialihkan ke kategori "Lainnya". Lanjutkan?`
        )
      ) {
        return;
      }
      setStockItems((prev) =>
        prev.map((item) => (item.jenis === name ? { ...item, jenis: 'Lainnya' } : item))
      );
    }
    setProductTypes((prev) => prev.filter((t) => t !== name));
  };

  // Master Data: Add, Edit, Delete Product Brands
  const handleAddProductBrand = (name: string) => {
    if (productBrands.includes(name)) {
      alert(`Merk "${name}" sudah ada.`);
      return;
    }
    setProductBrands((prev) => [...prev, name]);
  };

  const handleEditProductBrand = (oldName: string, newName: string) => {
    setProductBrands((prev) => prev.map((b) => (b === oldName ? newName : b)));
    setStockItems((prev) =>
      prev.map((item) => (item.merkProduk === oldName ? { ...item, merkProduk: newName } : item))
    );
  };

  const handleDeleteProductBrand = (name: string) => {
    const isUsed = stockItems.some((i) => i.merkProduk === name);
    if (isUsed) {
      if (
        !confirm(
          `Merk "${name}" sedang digunakan oleh beberapa produk. Jika dihapus, produk tersebut akan dialihkan ke "RCA Skincare Premium". Lanjutkan?`
        )
      ) {
        return;
      }
      setStockItems((prev) =>
        prev.map((item) =>
          item.merkProduk === name ? { ...item, merkProduk: 'RCA Skincare Premium' } : item
        )
      );
    }
    setProductBrands((prev) => prev.filter((b) => b !== name));
  };

  // Handler: Stock Opname result applied
  const handleApplyOpname = (record: StockOpnameRecord) => {
    const updatedStock = stockItems.map((item) => {
      if (item.id === record.itemId) {
        const newBranchQty = record.stokFisik;
        const newTotal =
          (record.branch === 'springhill' ? newBranchQty : item.jumlah.springhill) +
          (record.branch === 'sudirman' ? newBranchQty : item.jumlah.sudirman) +
          (record.branch === 'pangkalan-balai' ? newBranchQty : item.jumlah['pangkalan-balai']);

        return {
          ...item,
          terakhirOpname: record.date,
          keterangan: `${item.keterangan.split(' | Opname:')[0]} | Opname: ${record.date} (${record.kategoriSelisih})`,
          jumlah: {
            ...item.jumlah,
            [record.branch]: newBranchQty,
            total: newTotal,
          },
        };
      }
      return item;
    });

    setStockItems(updatedStock);
    triggerAutoSync(updatedStock);
  };

  // Handler: Stock Transfer applied
  const handleApplyTransfer = (record: StockTransferRecord) => {
    const updatedStock = stockItems.map((item) => {
      if (item.id === record.itemId) {
        const currentSourceQty = item.jumlah[record.fromBranch] ?? 0;
        const currentTargetQty = item.jumlah[record.toBranch] ?? 0;

        const nextSourceQty = Math.max(0, currentSourceQty - record.qty);
        const nextTargetQty = currentTargetQty + record.qty;

        const updatedJumlah = {
          ...item.jumlah,
          [record.fromBranch]: nextSourceQty,
          [record.toBranch]: nextTargetQty,
        };

        return {
          ...item,
          jumlah: updatedJumlah,
        };
      }
      return item;
    });

    setStockItems(updatedStock);
    triggerAutoSync(updatedStock);
  };

  // Handler: Add new product
  const handleAddProduct = (newItem: StockItem) => {
    const total =
      (newItem.jumlah.springhill || 0) +
      (newItem.jumlah.sudirman || 0) +
      (newItem.jumlah['pangkalan-balai'] || 0);

    const sanitizedItem: StockItem = {
      ...newItem,
      id: newItem.id || `stk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      no: stockItems.length + 1,
      jumlah: {
        ...newItem.jumlah,
        total,
      },
    };
    const updatedStock = [sanitizedItem, ...stockItems];
    setStockItems(updatedStock);
    triggerAutoSync(updatedStock);
  };

  // Handler: Restore from JSON Backup
  const handleRestoreBackup = (backup: ClinicBackupData) => {
    if (backup.stockItems) setStockItems(backup.stockItems);
    if (backup.transactions) setTransactions(backup.transactions);
    if (backup.expenses) setExpenses(backup.expenses);
    if (backup.productTypes) setProductTypes(backup.productTypes);
    if (backup.productBrands) setProductBrands(backup.productBrands);
    triggerAutoSync(backup.stockItems, backup.transactions, backup.expenses);
  };

  // Handler: Reset Transactions
  const handleResetTransactions = () => {
    setTransactions([]);
    setExpenses([]);
    triggerAutoSync(undefined, [], []);
  };

  // Handler: Factory Reset
  const handleResetToFactory = () => {
    setStockItems(INITIAL_STOCK_ITEMS);
    setTransactions(INITIAL_TRANSACTIONS);
    setExpenses(INITIAL_EXPENSES);
    setProductTypes(INITIAL_PRODUCT_TYPES);
    setProductBrands(INITIAL_PRODUCT_BRANDS);
    triggerAutoSync(INITIAL_STOCK_ITEMS, INITIAL_TRANSACTIONS, INITIAL_EXPENSES);
  };

  // Handler: Update Admin Password
  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
  };

  // Handler: Reset Transactions for a Specific Month with optional Stock Reversal
  const handleMonthlyResetTransactions = (month: string, revertStock: boolean) => {
    const toRemove = transactions.filter((t) => t.timestamp.startsWith(month));
    if (toRemove.length === 0) {
      alert(`Tidak ada transaksi yang cocok untuk periode bulan ${month}.`);
      return;
    }

    let updatedStock = stockItems;
    if (revertStock) {
      updatedStock = stockItems.map((item) => {
        let addSH = 0;
        let addSD = 0;
        let addPB = 0;

        toRemove.forEach((trx) => {
          trx.items.forEach((it) => {
            if (it.itemId === item.id && it.isSkincareProduct) {
              if (trx.branch === 'springhill') addSH += it.qty;
              else if (trx.branch === 'sudirman') addSD += it.qty;
              else if (trx.branch === 'pangkalan-balai') addPB += it.qty;
            }
          });
        });

        const newSH = item.jumlah.springhill + addSH;
        const newSD = item.jumlah.sudirman + addSD;
        const newPB = item.jumlah['pangkalan-balai'] + addPB;

        return {
          ...item,
          jumlah: {
            springhill: newSH,
            sudirman: newSD,
            'pangkalan-balai': newPB,
            total: newSH + newSD + newPB,
          },
        };
      });
      setStockItems(updatedStock);
    }

    const updatedTrx = transactions.filter((t) => !t.timestamp.startsWith(month));
    setTransactions(updatedTrx);
    triggerAutoSync(updatedStock, updatedTrx);

    alert(
      `Sukses mereset ${toRemove.length} transaksi untuk bulan ${month}.${
        revertStock ? ' Saldo stok produk telah dikembalikan ke cabang.' : ''
      }`
    );
  };

  // Handler: Export Excel based on current context
  const handleExportExcel = () => {
    if (currentTab === 'stock') {
      exportStockOpnameToExcel(stockItems, selectedBranch);
    } else if (currentTab === 'transactions') {
      exportTransactionsToExcel(transactions, selectedBranch);
    } else {
      exportStockOpnameToExcel(stockItems, selectedBranch);
      setTimeout(() => {
        exportTransactionsToExcel(transactions, selectedBranch);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        branches={branches}
        stockItems={stockItems}
        onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        onOpenLowStock={() => setIsLowStockOpen(true)}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
        onOpenDoc={() => setIsDocOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenDownloadApk={() => setIsDownloadApkOpen(true)}
        isSheetsConnected={!!spreadsheetId}
        sheetsUrl={spreadsheetUrl}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            branches={branches}
            stockItems={stockItems}
            transactions={transactions}
            onOpenLowStock={() => setIsLowStockOpen(true)}
            onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
            onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
            onExportExcel={handleExportExcel}
            onOpenEditBranch={(b) => setBranchToEdit(b)}
          />
        )}

        {/* Dedicated Simple POS Page */}
        {currentTab === 'pos' && (
          <PosView
            stockItems={stockItems}
            branches={branches}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            onSubmitTransaction={handleSubmitTransaction}
          />
        )}

        {currentTab === 'stock' && (
          <StockOpnameView
            stockItems={stockItems}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
            onOpenEditProduct={(item) => setProductToEdit(item)}
            onDeleteProduct={(item) => setProductToDelete(item)}
            onOpenStockOpnameForm={(item) => {
              setOpnameTargetItem(item || null);
              setIsStockOpnameOpen(true);
            }}
            onOpenTransferStock={(item) => {
              setTransferTargetItem(item || null);
              setTransferTargetBranch(undefined);
              setIsTransferOpen(true);
            }}
            onExportExcel={handleExportExcel}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            expenses={expenses}
            stockItems={stockItems}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
            onOpenEditTransaction={(trx) => setTransactionToEdit(trx)}
            onDeleteTransaction={(trx) => setTransactionToDelete(trx)}
            onOpenInvoice={(trx) => setInvoiceModalTrx(trx)}
            onExportExcel={handleExportExcel}
            onOpenMonthlyReset={() => setIsMonthlyResetOpen(true)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminSettingsView
            productTypes={productTypes}
            productBrands={productBrands}
            stockItems={stockItems}
            transactions={transactions}
            expenses={expenses}
            branches={branches}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            onAddProductType={handleAddProductType}
            onEditProductType={handleEditProductType}
            onDeleteProductType={handleDeleteProductType}
            onAddProductBrand={handleAddProductBrand}
            onEditProductBrand={handleEditProductBrand}
            onDeleteProductBrand={handleDeleteProductBrand}
            onOpenNewExpense={() => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            }}
            onOpenEditExpense={(exp) => {
              setExpenseToEdit(exp);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={(exp) => setExpenseToDelete(exp)}
            onRestoreBackup={handleRestoreBackup}
            onResetTransactions={handleResetTransactions}
            onResetToFactory={handleResetToFactory}
            onOpenMonthlyReset={() => setIsMonthlyResetOpen(true)}
            adminPassword={adminPassword}
            onUpdateAdminPassword={handleUpdateAdminPassword}
            onOpenEditBranch={(b) => setBranchToEdit(b)}
          />
        )}
      </main>

      {/* Modals */}
      <LowStockAlertModal
        isOpen={isLowStockOpen}
        onClose={() => setIsLowStockOpen(false)}
        stockItems={stockItems}
        onOpenTransfer={(item, targetBranch) => {
          setTransferTargetItem(item);
          setTransferTargetBranch(targetBranch);
          setIsTransferOpen(true);
        }}
      />

      <StockOpnameModal
        isOpen={isStockOpnameOpen}
        onClose={() => {
          setIsStockOpnameOpen(false);
          setOpnameTargetItem(null);
        }}
        selectedItem={opnameTargetItem}
        stockItems={stockItems}
        onApplyOpname={handleApplyOpname}
      />

      <StockTransferModal
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          setTransferTargetItem(null);
          setTransferTargetBranch(undefined);
        }}
        selectedItem={transferTargetItem}
        targetBranchDefault={transferTargetBranch}
        stockItems={stockItems}
        onApplyTransfer={handleApplyTransfer}
      />

      <NewTransactionModal
        isOpen={isNewTransactionOpen}
        onClose={() => setIsNewTransactionOpen(false)}
        stockItems={stockItems}
        defaultBranch={selectedBranch === 'all' ? 'NONE' : selectedBranch}
        onSubmitTransaction={handleSubmitTransaction}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        productTypes={productTypes}
        productBrands={productBrands}
        onAddProduct={handleAddProduct}
        existingCount={stockItems.length}
      />

      <EditProductModal
        isOpen={!!productToEdit}
        onClose={() => setProductToEdit(null)}
        product={productToEdit}
        productTypes={productTypes}
        productBrands={productBrands}
        onSaveProduct={handleSaveProduct}
      />

      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Hapus Produk dari Master Stok"
        message="Apakah Anda yakin ingin menghapus produk ini dari master database klinik? Riwayat transaksi lama akan tetap menyimpan nama produk ini secara aman."
        itemName={productToDelete ? `${productToDelete.nama} (${productToDelete.merkProduk})` : ''}
        onConfirm={handleConfirmDeleteProduct}
      />

      <EditTransactionModal
        isOpen={!!transactionToEdit}
        onClose={() => setTransactionToEdit(null)}
        transaction={transactionToEdit}
        onSaveTransaction={handleSaveTransaction}
      />

      <DeleteConfirmModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        title="Hapus Catatan Transaksi"
        message="Apakah Anda yakin ingin membatalkan dan menghapus transaksi ini? Tindakan ini akan menghapus invoice dari register penjualan."
        itemName={transactionToDelete ? `${transactionToDelete.id} - ${transactionToDelete.patientName} (${transactionToDelete.timestamp})` : ''}
        extraOption={{
          label: 'Kembalikan saldo kuantitas obat/skincare ke cabang terkait (Reversal Stok Otomatis)',
          checked: revertStockOnDeleteTrx,
          onChange: setRevertStockOnDeleteTrx,
        }}
        onConfirm={handleConfirmDeleteTransaction}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
        defaultBranch={selectedBranch === 'all' ? 'springhill' : selectedBranch}
        onSaveExpense={handleSaveExpense}
      />

      <DeleteConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="Hapus Catatan Pengeluaran Kas"
        message="Apakah Anda yakin ingin menghapus beban pengeluaran operasional ini dari catatan keuangan?"
        itemName={expenseToDelete ? `${expenseToDelete.title} - Rp ${expenseToDelete.amount.toLocaleString('id-ID')} (${expenseToDelete.branch})` : ''}
        onConfirm={handleConfirmDeleteExpense}
      />

      <InvoicePrintModal
        isOpen={!!invoiceModalTrx}
        onClose={() => setInvoiceModalTrx(null)}
        transaction={invoiceModalTrx}
        branches={branches}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        stockItems={stockItems}
        transactions={transactions}
        expenses={expenses}
        branches={branches}
        user={user}
        setUser={setUser}
        spreadsheetId={spreadsheetId}
        setSpreadsheetId={setSpreadsheetId}
        spreadsheetUrl={spreadsheetUrl}
        setSpreadsheetUrl={setSpreadsheetUrl}
        lastSyncedAt={lastSyncedAt}
        setLastSyncedAt={setLastSyncedAt}
        onLoadDataFromSheets={handleLoadFromSheets}
        isLoadingFromSheets={isLoadingFromSheets}
      />

      <AiAdvisorModal
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        selectedBranch={selectedBranch}
        stockItems={stockItems}
        transactions={transactions}
      />

      <DocumentationModal
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
      />

      <DownloadApkModal
        isOpen={isDownloadApkOpen}
        onClose={() => setIsDownloadApkOpen(false)}
      />

      <MonthlyResetModal
        isOpen={isMonthlyResetOpen}
        onClose={() => setIsMonthlyResetOpen(false)}
        transactions={transactions}
        onConfirmResetMonth={handleMonthlyResetTransactions}
        currentAdminPassword={adminPassword}
      />

      <EditBranchModal
        isOpen={!!branchToEdit}
        onClose={() => setBranchToEdit(null)}
        branch={branchToEdit}
        onSaveBranch={handleSaveBranch}
      />
    </div>
  );
}
