import { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useTransactionsQuery } from "../api/transaction.queries";
import { useWalletsQuery } from "@/features/wallets/api/wallet.queries";
import { TransactionFormDialog } from "../components/transaction-form-dialog";
import { TransactionDeleteDialog } from "../components/transaction-delete-dialog";
import { formatCurrency, cn, getDefaultMonthYear } from "@/lib/utils";
import { Route as AuthRoute } from "@/routes/_auth";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  ArrowUpDown,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet as WalletIcon,
  Tag,
  Receipt,
  Calendar,
} from "lucide-react";
import type { Transaction } from "../api/transaction.contract";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function TransactionView() {
  const search = useSearch({ strict: false }) as Record<string, string | number | undefined>;
  const navigate = useNavigate();

  // Extract pagination values from search parameters
  const page = Number(search.page) || 1;
  const limit = Number(search.limit) || 10;
  const searchTerm = (search.search as string) || "";
  const walletIdFilter = (search.wallet_id as string) || "";
  const typeFilter = (search.type as "IN" | "OUT" | "TRANSFER" | "") || "";

  const user = AuthRoute.useLoaderData();

  // Calendar Picker Year/Month configuration
  const today = new Date();
  const todayYear = String(today.getFullYear());
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
  const currentMonthYear = getDefaultMonthYear(user?.salary_day ?? 1);

  const yearMonthFilter = search.year_month !== undefined ? (search.year_month as string) : currentMonthYear;

  // Fetch transactions list
  const { data: response, isLoading, isError, error, refetch } = useTransactionsQuery({
    page,
    limit,
    search: searchTerm || undefined,
    wallet_id: walletIdFilter || undefined,
    type: typeFilter || undefined,
    year_month: yearMonthFilter || undefined,
  });
  const transactions = response?.data || [];
  const pagination = response?.pagination;

  // Fetch Wallets for filters
  const { data: walletsRes } = useWalletsQuery();
  const walletsList = walletsRes?.data || [];

  // Modal Dialog local states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formInitialTab, setFormInitialTab] = useState<"transaction" | "transfer">("transaction");

  // Search input local state
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Dropdown popover open states
  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);
  const [isWalletPopoverOpen, setIsWalletPopoverOpen] = useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const activeYear = yearMonthFilter ? yearMonthFilter.substring(0, 4) : todayYear;
  const activeMonth = yearMonthFilter ? yearMonthFilter.substring(5, 7) : "";
  const [viewingYear, setViewingYear] = useState(parseInt(activeYear));

  // Sync viewingYear with activeYear when activeYear changes in URL
  const [lastActiveYear, setLastActiveYear] = useState(activeYear);
  if (activeYear !== lastActiveYear) {
    setLastActiveYear(activeYear);
    setViewingYear(parseInt(activeYear));
  }

  const monthOptions = [
    { value: "01", label: "January", shortLabel: "Jan" },
    { value: "02", label: "February", shortLabel: "Feb" },
    { value: "03", label: "March", shortLabel: "Mar" },
    { value: "04", label: "April", shortLabel: "Apr" },
    { value: "05", label: "May", shortLabel: "May" },
    { value: "06", label: "June", shortLabel: "Jun" },
    { value: "07", label: "July", shortLabel: "Jul" },
    { value: "08", label: "August", shortLabel: "Aug" },
    { value: "09", label: "September", shortLabel: "Sep" },
    { value: "10", label: "October", shortLabel: "Oct" },
    { value: "11", label: "November", shortLabel: "Nov" },
    { value: "12", label: "December", shortLabel: "Dec" },
  ];

  // Active filter label displays
  const selectedTypeLabel =
    typeFilter === "IN"
      ? "Income"
      : typeFilter === "OUT"
        ? "Expense"
        : typeFilter === "TRANSFER"
          ? "Transfer"
          : "All Types";
  const selectedWalletLabel = walletIdFilter
    ? walletsList.find((w) => w.id === walletIdFilter)?.name || "All Wallets"
    : "All Wallets";

  const activeMonthLabel = monthOptions.find((m) => m.value === activeMonth)?.label || "";
  const selectedDateLabel = yearMonthFilter ? `${activeMonthLabel} ${activeYear}` : "All Time";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({
      to: "/transactions",
      search: {
        ...search,
        page: 1, // reset page
        search: localSearch || undefined,
      },
    });
  };

  const handleWalletFilterChange = (walletId: string) => {
    void navigate({
      to: "/transactions",
      search: {
        ...search,
        page: 1,
        wallet_id: walletId || undefined,
      },
    });
  };

  const handleTypeFilterChange = (type: "IN" | "OUT" | "TRANSFER" | "") => {
    void navigate({
      to: "/transactions",
      search: {
        ...search,
        page: 1,
        type: type || undefined,
      },
    });
  };

  const handleYearDateFilterChange = (newYearMonth: string) => {
    void navigate({
      to: "/transactions",
      search: {
        ...search,
        page: 1,
        year_month: newYearMonth !== undefined ? newYearMonth : undefined,
      },
    });
  };

  const handlePrevYear = () => {
    setViewingYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setViewingYear((prev) => prev + 1);
  };

  const handleAddClick = () => {
    setSelectedTransaction(null);
    setFormInitialTab("transaction");
    setIsFormOpen(true);
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormInitialTab(transaction.linked_transaction_id ? "transfer" : "transaction");
    setIsFormOpen(true);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteOpen(true);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      void navigate({
        to: "/transactions",
        search: {
          ...search,
          page: page - 1,
        },
      });
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      void navigate({
        to: "/transactions",
        search: {
          ...search,
          page: page + 1,
        },
      });
    }
  };




  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 border border-dashed border-red-200 bg-red-50/10 rounded-2xl text-center max-w-2xl mx-auto my-12 animate-in fade-in">
        <AlertCircle className="size-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 mb-1">Failed to load transactions</h3>
        <p className="text-sm text-zinc-500 mb-4">{(error as Error)?.message || "Something went wrong."}</p>
        <button
          onClick={() => refetch()}
          className="rounded-full px-6 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold cursor-pointer shadow"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Transactions</h1>
          <p className="text-sm text-zinc-500 mt-1 select-none">
            Monitor and record cashflows, expenses, and wallet transfers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto select-none">
          <button
            onClick={handleAddClick}
            className="rounded-xl px-5 h-11 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="size-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>



      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-white border border-zinc-150 rounded-2xl shadow-xs select-none">
        {/* Left Side: Inputs */}
        <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white h-10 pl-10 pr-4 text-xs w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm"
            />
          </form>

          {/* Type Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsTypePopoverOpen(!isTypePopoverOpen);
                setIsWalletPopoverOpen(false);
                setIsDatePopoverOpen(false);
              }}
              className={cn(
                "flex items-center justify-between gap-2.5 bg-white border border-zinc-200 rounded-xl px-4 h-10 shadow-sm text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-all select-none cursor-pointer w-full sm:w-auto",
                isTypePopoverOpen && "ring-1 ring-zinc-950 border-zinc-950"
              )}
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-3.5 text-zinc-400" />
                <span>{selectedTypeLabel}</span>
              </div>
              <ChevronDown className={cn("size-3.5 text-zinc-400 shrink-0 transition-transform duration-200", isTypePopoverOpen && "rotate-180")} />
            </button>

            {isTypePopoverOpen && (
              <>
                <div className="fixed inset-0 z-20 cursor-default" onClick={() => setIsTypePopoverOpen(false)} />
                <div className="absolute left-0 top-11.5 z-30 w-40 bg-white border border-zinc-150 rounded-2xl p-1.5 shadow-lg flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      handleTypeFilterChange("");
                      setIsTypePopoverOpen(false);
                    }}
                    className={cn(
                      "w-full text-left py-2 px-3 text-xs font-medium rounded-xl transition-all cursor-pointer",
                      typeFilter === ""
                        ? "bg-zinc-900 text-white font-semibold shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    All Types
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleTypeFilterChange("IN");
                      setIsTypePopoverOpen(false);
                    }}
                    className={cn(
                      "w-full text-left py-2 px-3 text-xs font-medium rounded-xl transition-all cursor-pointer",
                      typeFilter === "IN"
                        ? "bg-zinc-900 text-white font-semibold shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleTypeFilterChange("OUT");
                      setIsTypePopoverOpen(false);
                    }}
                    className={cn(
                      "w-full text-left py-2 px-3 text-xs font-medium rounded-xl transition-all cursor-pointer",
                      typeFilter === "OUT"
                        ? "bg-zinc-900 text-white font-semibold shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleTypeFilterChange("TRANSFER");
                      setIsTypePopoverOpen(false);
                    }}
                    className={cn(
                      "w-full text-left py-2 px-3 text-xs font-medium rounded-xl transition-all cursor-pointer",
                      typeFilter === "TRANSFER"
                        ? "bg-zinc-900 text-white font-semibold shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    Transfer
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Wallet Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsWalletPopoverOpen(!isWalletPopoverOpen);
                setIsTypePopoverOpen(false);
                setIsDatePopoverOpen(false);
              }}
              className={cn(
                "flex items-center justify-between gap-2.5 bg-white border border-zinc-200 rounded-xl px-4 h-10 shadow-sm text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-all select-none cursor-pointer w-full sm:w-auto",
                isWalletPopoverOpen && "ring-1 ring-zinc-950 border-zinc-950"
              )}
            >
              <div className="flex items-center gap-2">
                <WalletIcon className="size-3.5 text-zinc-400" />
                <span>{selectedWalletLabel}</span>
              </div>
              <ChevronDown className={cn("size-3.5 text-zinc-400 shrink-0 transition-transform duration-200", isWalletPopoverOpen && "rotate-180")} />
            </button>

            {isWalletPopoverOpen && (
              <>
                <div className="fixed inset-0 z-20 cursor-default" onClick={() => setIsWalletPopoverOpen(false)} />
                <div className="absolute left-0 top-11.5 z-30 w-48 max-h-60 overflow-y-auto bg-white border border-zinc-150 rounded-2xl p-1.5 shadow-lg flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      handleWalletFilterChange("");
                      setIsWalletPopoverOpen(false);
                    }}
                    className={cn(
                      "w-full text-left py-2 px-3 text-xs font-medium rounded-xl transition-all cursor-pointer",
                      walletIdFilter === ""
                        ? "bg-zinc-900 text-white font-semibold shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    All Wallets
                  </button>
                  {walletsList.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        handleWalletFilterChange(w.id);
                        setIsWalletPopoverOpen(false);
                      }}
                      className={cn(
                        "w-full text-left py-2 px-3 text-xs font-medium rounded-xl transition-all cursor-pointer truncate",
                        walletIdFilter === w.id
                          ? "bg-zinc-900 text-white font-semibold shadow-sm"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      )}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Month/Year Date Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsDatePopoverOpen(!isDatePopoverOpen);
                setIsTypePopoverOpen(false);
                setIsWalletPopoverOpen(false);
              }}
              className={cn(
                "flex items-center justify-between gap-2.5 bg-white border border-zinc-200 rounded-xl px-4 h-10 shadow-sm text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-all select-none cursor-pointer w-full sm:w-auto",
                isDatePopoverOpen && "ring-1 ring-zinc-950 border-zinc-950"
              )}
            >
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-zinc-400" />
                <span>{selectedDateLabel}</span>
              </div>
              <ChevronDown className={cn("size-3.5 text-zinc-400 shrink-0 transition-transform duration-200", isDatePopoverOpen && "rotate-180")} />
            </button>

            {isDatePopoverOpen && (
              <>
                {/* Invisible backdrop to dismiss popover */}
                <div className="fixed inset-0 z-20 cursor-default" onClick={() => setIsDatePopoverOpen(false)} />
                
                {/* Calendar Month/Year popover panel */}
                <div className="absolute left-0 top-11.5 z-30 w-72 bg-white border border-zinc-150 rounded-2xl p-4 shadow-lg flex flex-col gap-3 select-none animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Popover Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                    <button
                      type="button"
                      onClick={handlePrevYear}
                      className="p-1 rounded-lg hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center size-7"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="font-bold text-sm text-zinc-800">{viewingYear}</span>
                    <button
                      type="button"
                      onClick={handleNextYear}
                      className="p-1 rounded-lg hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center size-7"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                  
                  {/* Months Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {monthOptions.map((month) => {
                      const isSelected = activeYear === String(viewingYear) && activeMonth === month.value && yearMonthFilter !== "";
                      const isToday = todayYear === String(viewingYear) && todayMonth === month.value;
                      
                      return (
                        <button
                          key={month.value}
                          type="button"
                          onClick={() => {
                            const newMonthYear = `${viewingYear}-${month.value}`;
                            handleYearDateFilterChange(newMonthYear);
                            setIsDatePopoverOpen(false);
                          }}
                          className={cn(
                            "py-2.5 px-1 text-xs rounded-xl font-medium transition-all cursor-pointer text-center relative border-0",
                            isSelected
                              ? "bg-zinc-900 text-white font-semibold shadow-sm hover:bg-zinc-850"
                              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 bg-transparent"
                          )}
                        >
                          {month.shortLabel}
                          {isToday && !isSelected && (
                            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-zinc-900" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* All Time Clear Button */}
                  <div className="mt-3 pt-2 border-t border-zinc-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        handleYearDateFilterChange("");
                        setIsDatePopoverOpen(false);
                      }}
                      className="w-full text-center py-1.5 text-xs font-semibold rounded-xl text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all cursor-pointer border-0 bg-transparent"
                    >
                      Clear Filter (All Time)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Clear Filters (if any are active) */}
        {(searchTerm || walletIdFilter || typeFilter || yearMonthFilter) && (
          <button
            onClick={() => {
              setLocalSearch("");
              void navigate({
                to: "/transactions",
                search: {},
              });
            }}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer self-start lg:self-auto py-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Content (Table) */}
      {isLoading ? (
        // Skeletons
        <div className="border border-zinc-150 bg-white rounded-2xl p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-6 border-b border-zinc-100 pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-200 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-3 w-36 bg-zinc-200 rounded" />
                  <div className="h-2 w-24 bg-zinc-200 rounded" />
                </div>
              </div>
              <div className="h-4 w-16 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        // Empty State Banner
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-250/70 rounded-2xl bg-white shadow-xs max-w-xl mx-auto text-center select-none animate-in fade-in duration-300">
          <div className="size-14 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
            <FolderOpen className="size-6.5" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 mb-1">No transactions found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
            Record single income/expense entries or perform transfers between wallets to begin tracking your budget transactions.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleAddClick}
              className="rounded-xl px-5 h-10 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="size-4" />
              <span>Create First Transaction</span>
            </button>
          </div>
        </div>
      ) : (
        // Table view
        <div className="overflow-x-auto border border-zinc-150 bg-white rounded-2xl shadow-xs animate-in fade-in duration-400">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-150 bg-zinc-50/30 select-none">
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Date & Description</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Wallet</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Category</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Amount</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {transactions.map((tx) => {
                const formattedAmount = formatCurrency(Number(tx.amount) || 0);
                const isTransfer = !!tx.linked_transaction_id;

                return (
                  <tr key={tx.id} className="hover:bg-zinc-50/40 transition-colors group">
                    {/* Date & Description */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "size-8.5 rounded-lg border flex items-center justify-center shrink-0 select-none mt-0.5",
                            isTransfer
                              ? tx.type === "IN"
                                ? "bg-blue-50 border-blue-100 text-blue-500"
                                : "bg-amber-50 border-amber-100 text-amber-500"
                              : tx.type === "IN"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-500"
                                : "bg-red-50 border-red-100 text-red-500"
                          )}
                        >
                          {isTransfer ? (
                            tx.type === "IN" ? (
                              <ArrowDownLeft className="size-4.5" />
                            ) : (
                              <ArrowUpRight className="size-4.5" />
                            )
                          ) : (
                            <Receipt className="size-4.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          {isTransfer ? (
                            <div className="flex flex-col gap-0.5">
                              <h4 className="font-semibold text-zinc-900 text-sm truncate max-w-[200px] md:max-w-xs pr-2">
                                {tx.description || "Transfer"}
                              </h4>
                              <span className="text-[11px] font-medium text-zinc-400 select-none">
                                {tx.type === "OUT" ? (
                                  <>
                                    to <span className="font-semibold text-zinc-600">{tx.linked_transaction?.wallet_name || "Unknown"}</span>
                                  </>
                                ) : (
                                  <>
                                    from <span className="font-semibold text-zinc-600">{tx.linked_transaction?.wallet_name || "Unknown"}</span>
                                  </>
                                )}
                              </span>
                            </div>
                          ) : (
                            <h4 className="font-semibold text-zinc-900 text-sm truncate max-w-[200px] md:max-w-xs pr-2">
                              {tx.description}
                            </h4>
                          )}
                          <span className="text-[10px] text-zinc-400 font-medium block mt-1 select-none">
                            {formatDate(tx.transaction_date)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Wallet */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-500 font-medium text-sm">
                        <WalletIcon className="size-4 text-zinc-400 shrink-0" />
                        <span>{tx.wallet?.name || "Unknown"}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      {isTransfer ? (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full select-none flex items-center gap-1 w-max">
                          <ArrowUpDown className="size-3" />
                          Transfer
                        </span>
                      ) : tx.budget ? (
                        <span className="text-[10px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full select-none flex items-center gap-1 w-max">
                          <Tag className="size-3" />
                          {tx.budget.category}
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-medium text-xs">-</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "font-bold text-sm",
                          tx.type === "IN" ? "text-emerald-600" : "text-red-600"
                        )}
                      >
                        {tx.type === "IN" ? "+" : "-"}
                        {formattedAmount}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditClick(tx)}
                          className="size-8 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                          title="Edit Transaction"
                        >
                          <Pencil className="size-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteClick(tx)}
                          className="size-8 rounded-lg bg-red-50/30 hover:bg-red-50 border border-red-100/70 text-red-500 hover:text-red-700 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                          title="Delete Transaction"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && transactions.length > 0 && pagination && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-150 mt-8 select-none">
          <span className="text-xs font-semibold text-zinc-500">
            Page {page}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1}
              className="size-9 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="size-4 text-zinc-700" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
              className="size-9 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="size-4 text-zinc-700" />
            </button>
          </div>
        </div>
      )}

      {/* Forms & Dialogs */}
      <TransactionFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        transaction={selectedTransaction}
        initialTab={formInitialTab}
      />

      <TransactionDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
