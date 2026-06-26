import { useEffect, useState, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, X, AlertTriangle, ArrowUpDown, Receipt, ArrowDown, Wallet, Tag, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BottomSheet, useIsMobile } from "@/components/ui/bottom-sheet";
import { transactionSchema, transferSchema, type Transaction } from "../api/transaction.contract";
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useCreateTransferMutation,
} from "../api/transaction.mutations";
import { useWalletsQuery } from "@/features/wallets/api/wallet.queries";
import { useBudgetsQuery } from "@/features/budgets/api/budget.queries";
import { Route as AuthRoute } from "@/routes/_auth";

interface TransactionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null; // If provided, we are editing
  initialTab?: "transaction" | "transfer";
}

export function TransactionFormDialog({ isOpen, onClose, transaction, initialTab }: TransactionFormDialogProps) {
  const isEditing = !!transaction;
  const isTransferEdit = isEditing && !!transaction?.linked_transaction_id;

  const [activeTab, setActiveTab] = useState<"transaction" | "transfer">("transaction");

  // Keep body scroll locked when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Set correct initial tab on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (isEditing) {
          setActiveTab(isTransferEdit ? "transfer" : "transaction");
        } else {
          setActiveTab(initialTab || "transaction");
        }
      }, 0);
    }
  }, [isOpen, isEditing, isTransferEdit, initialTab]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border border-zinc-150 rounded-2xl w-full max-w-md shadow-xl relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4.5 right-4.5 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer z-10"
              >
                <X className="size-4.5" />
              </button>

              {/* Dialog Header */}
              <div className="px-6 pt-6 pb-4 border-b border-zinc-100 text-left shrink-0">
                <h3 className="text-lg font-bold text-zinc-900">
                  {isEditing
                    ? isTransferEdit
                      ? "Edit Transfer"
                      : "Edit Transaction"
                    : activeTab === "transaction"
                    ? "Add New Transaction"
                    : "Transfer Funds"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                  {isEditing
                    ? isTransferEdit
                      ? "Modify transfer description or date details"
                      : "Modify your transaction details below"
                    : activeTab === "transaction"
                    ? "Record a new income or expense transaction"
                    : "Move money between your wallets"}
                </p>

                {/* Tabs (Only visible when adding new records) */}
                {!isEditing && (
                  <div className="flex bg-zinc-100 p-1 rounded-xl mt-4 select-none relative z-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab("transaction")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer relative z-10",
                        activeTab === "transaction"
                          ? "text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-900"
                      )}
                    >
                      <Receipt className="size-3.5" />
                      <span>Transaction</span>
                      {activeTab === "transaction" && (
                        <motion.div
                          layoutId="activeFormTab"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("transfer")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer relative z-10",
                        activeTab === "transfer"
                          ? "text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-900"
                      )}
                    >
                      <ArrowUpDown className="size-3.5" />
                      <span>Transfer</span>
                      {activeTab === "transfer" && (
                        <motion.div
                          layoutId="activeFormTab"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Form Content */}
              <div className="w-full">
                {isTransferEdit && (
                  <div className="m-6 mb-2 p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2.5 text-amber-800 text-xs text-left">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <span className="font-bold">Transfer Transaction:</span> Wallets and amounts cannot be modified. To change these, please delete this transfer and create a new one.
                    </div>
                  </div>
                )}

                {activeTab === "transaction" || isEditing ? (
                  <TransactionForm
                    transaction={transaction}
                    isTransferEdit={isTransferEdit}
                    onClose={onClose}
                  />
                ) : (
                  <TransferForm onClose={onClose} />
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ==========================================================================
   Single Transaction Form Component
   ========================================================================== */
interface TransactionFormProps {
  transaction?: Transaction | null;
  isTransferEdit: boolean;
  onClose: () => void;
}

function TransactionForm({ transaction, isTransferEdit, onClose }: TransactionFormProps) {
  const createTxMutation = useCreateTransactionMutation();
  const updateTxMutation = useUpdateTransactionMutation();
  const isEditing = !!transaction;
  const isPending = createTxMutation.isPending || updateTxMutation.isPending;

  // Local state for wallets & dynamic date check
  const { data: walletsRes } = useWalletsQuery();
  const walletsList = walletsRes?.data || [];

  const [txDate, setTxDate] = useState(() => {
    if (transaction) return transaction.transaction_date.substring(0, 10);
    return new Date().toISOString().substring(0, 10);
  });

  const [txType, setTxType] = useState<"IN" | "OUT">(() => {
    if (transaction) return transaction.type;
    return "OUT";
  });

  const user = AuthRoute.useLoaderData();
  const salaryDay = user?.salary_day ?? 1;

  // Helper function to get backend cycle date range for checking
  const getBackendCycleDateRange = (monthYear: string, sDay: number) => {
    const [yearStr, monthStr] = monthYear.split("-");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1; // 0-indexed month

    if (sDay === 1) {
      const startDateObj = new Date(Date.UTC(year, monthIndex, 1));
      const endDateObj = new Date(Date.UTC(year, monthIndex + 1, 0));
      return {
        startDate: startDateObj.toISOString().substring(0, 10),
        endDate: endDateObj.toISOString().substring(0, 10)
      };
    }

    let prevMonthIndex = monthIndex - 1;
    let prevYear = year;
    if (prevMonthIndex < 0) {
      prevMonthIndex = 11;
      prevYear -= 1;
    }

    let startDateObj = new Date(Date.UTC(prevYear, prevMonthIndex, sDay));
    const actualStartMonth = startDateObj.getUTCMonth();
    if (actualStartMonth !== prevMonthIndex) {
      startDateObj = new Date(Date.UTC(prevYear, prevMonthIndex + 1, 0));
    }

    let currentSalaryDayObj = new Date(Date.UTC(year, monthIndex, sDay));
    const actualCurrentMonth = currentSalaryDayObj.getUTCMonth();
    if (actualCurrentMonth !== monthIndex) {
      currentSalaryDayObj = new Date(Date.UTC(year, monthIndex + 1, 0));
    }

    const endDateObj = new Date(currentSalaryDayObj.getTime() - 24 * 60 * 60 * 1000);

    const startDate = startDateObj.toISOString().substring(0, 10);
    const endDate = endDateObj.toISOString().substring(0, 10);

    return { startDate, endDate };
  };

  const getCycleMonth = (dateStr: string, sDay: number): string => {
    if (sDay === 1) {
      return dateStr.substring(0, 7);
    }

    const [yearStr, monthStr] = dateStr.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const formatYM = (y: number, m: number) => {
      return `${y}-${String(m).padStart(2, "0")}`;
    };

    const candidates = [
      { y: year, m: month },
      { y: month === 12 ? year + 1 : year, m: month === 12 ? 1 : month + 1 },
      { y: month === 1 ? year - 1 : year, m: month === 1 ? 12 : month - 1 },
    ];

    for (const cand of candidates) {
      const ym = formatYM(cand.y, cand.m);
      const { startDate, endDate } = getBackendCycleDateRange(ym, sDay);
      if (dateStr >= startDate && dateStr <= endDate) {
        return ym;
      }
    }

    return dateStr.substring(0, 7);
  };

  // Dynamic budget list fetching based on selected transaction month's budget cycle
  const activeMonthYear = getCycleMonth(txDate, salaryDay);
  const { data: budgetsRes } = useBudgetsQuery({ month_year: activeMonthYear, limit: 100 });
  const budgetsList = budgetsRes?.data || [];

  // Local state for amount display formatting
  const [amountInput, setAmountInput] = useState("");

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleChange: (v: number) => void
  ) => {
    const input = e.target;
    const rawVal = input.value;
    const selectionStart = input.selectionStart || 0;

    const valBeforeCursor = rawVal.substring(0, selectionStart);
    const digitsBeforeCursor = valBeforeCursor.replace(/\D/g, "").length;

    const cleanVal = rawVal.replace(/\D/g, "");
    const numericVal = cleanVal === "" ? null : Number(cleanVal);
    const formattedVal = cleanVal === "" ? "" : cleanVal.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    setAmountInput(formattedVal);
    handleChange(numericVal as unknown as number);

    requestAnimationFrame(() => {
      let newCursorPosition = 0;
      let digitCount = 0;
      for (let i = 0; i < formattedVal.length; i++) {
        if (digitCount === digitsBeforeCursor) {
          break;
        }
        if (/\d/.test(formattedVal[i])) {
          digitCount++;
        }
        newCursorPosition = i + 1;
      }
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };

  const form = useForm({
    defaultValues: {
      type: txType,
      wallet_id: transaction?.wallet_id || "",
      budget_id: transaction?.budget_id || (null as string | null),
      amount: transaction ? Number(transaction.amount) : (null as unknown as number),
      description: transaction?.description || "",
      transaction_date: txDate,
    },
    validators: {
      onChange: transactionSchema,
    },
    onSubmit: async ({ value }) => {
      // Rule: budget_id must be null if type is IN
      const payload = {
        ...value,
        budget_id: value.type === "IN" ? null : value.budget_id || null,
      };

      if (isEditing && transaction) {
        updateTxMutation.mutate(
          { transactionId: transaction.id, payload },
          {
            onSuccess: () => {
              form.reset();
              onClose();
            },
          }
        );
      } else {
        createTxMutation.mutate(payload, {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        });
      }
    },
  });

  // Pre-fill balance input if editing
  useEffect(() => {
    if (transaction) {
      const amt = Math.round(Number(transaction.amount)) || 0;
      setTimeout(() => {
        setAmountInput(amt === 0 ? "0" : amt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
      }, 0);
    }
  }, [transaction]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="p-6 space-y-4 text-left"
    >
      {/* Type Toggle Field (Disabled if editing a transfer) */}
      <form.Field
        name="type"
        children={(field) => {
          return (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                Transaction Type
              </Label>
              <div className="flex bg-zinc-100 p-1 rounded-xl select-none relative z-0">
                <button
                  type="button"
                  disabled={isTransferEdit}
                  onClick={() => {
                    field.handleChange("OUT");
                    setTxType("OUT");
                  }}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed relative z-10",
                    field.state.value === "OUT"
                      ? "text-red-600"
                      : "text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  Expense (OUT)
                  {field.state.value === "OUT" && (
                    <motion.div
                      layoutId="activeTxType"
                      className="absolute inset-0 bg-red-50 border border-red-200/80 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  disabled={isTransferEdit}
                  onClick={() => {
                    field.handleChange("IN");
                    setTxType("IN");
                  }}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed relative z-10",
                    field.state.value === "IN"
                      ? "text-emerald-700"
                      : "text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  Income (IN)
                  {field.state.value === "IN" && (
                    <motion.div
                      layoutId="activeTxType"
                      className="absolute inset-0 bg-emerald-50 border border-emerald-200/80 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            </div>
          );
        }}
      />
      {/* Wallet Select Field */}
      <form.Field
        name="wallet_id"
        children={(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          const walletOptions = walletsList.map((w) => ({
            value: w.id,
            label: w.name,
            sublabel: `Rp ${Math.round(Number(w.balance)).toLocaleString("id-ID")}`
          }));
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                Wallet
              </Label>
              <CustomSelect
                value={field.state.value}
                onChange={field.handleChange}
                options={walletOptions}
                placeholder="Select Wallet"
                icon={<Wallet className="size-4" />}
                disabled={isTransferEdit}
                hasError={hasError}
              />
              {hasError && (
                <p className="text-xs text-destructive font-medium mt-1 px-1">
                  Wallet is required
                </p>
              )}
            </div>
          );
        }}
      />

      {/* Budget Category Field (Only visible when Type is OUT) */}
      {txType === "OUT" && (
        <form.Field
          name="budget_id"
          children={(field) => {
            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
            const categoryOptions = budgetsList.map((b) => ({
              value: b.id,
              label: b.category,
              sublabel: `Limit: Rp ${Math.round(Number(b.amount)).toLocaleString("id-ID")}`
            }));
            return (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                  Category
                </Label>
                <CustomSelect
                  value={field.state.value || ""}
                  onChange={(val) => field.handleChange(val || null)}
                  options={[{ value: "", label: "No Category" }, ...categoryOptions]}
                  placeholder="No Category"
                  icon={<Tag className="size-4" />}
                  disabled={isTransferEdit}
                  hasError={hasError}
                  searchable={true}
                />
              </div>
            );
          }}
        />
      )}

      {/* Amount and Date in a 2-column grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Amount Field */}
        <form.Field
          name="amount"
          children={(field) => {
            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                  Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 select-none">
                    Rp
                  </span>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={amountInput}
                    disabled={isTransferEdit}
                    onBlur={field.handleBlur}
                    onChange={(e) => handleAmountChange(e, field.handleChange)}
                    placeholder="0"
                    className={cn(
                      "rounded-xl border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm disabled:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400",
                      hasError && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                <AnimatePresence>
                  {hasError && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="text-xs text-destructive font-medium mt-1 px-1"
                    >
                      Amount is required
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          }}
        />

        {/* Date Field */}
        <form.Field
          name="transaction_date"
          children={(field) => {
            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                  Date
                </Label>
                <CustomDatePicker
                  value={txDate}
                  onChange={(val) => {
                    field.handleChange(val);
                    setTxDate(val);
                  }}
                  hasError={hasError}
                />
              </div>
            );
          }}
        />
      </div>

      {/* Description Field */}
      <form.Field
        name="description"
        children={(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                Description
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Pembelian bensin, Gaji freelance"
                className={cn(
                  "rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm",
                  hasError && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <AnimatePresence>
                {hasError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="text-xs text-destructive font-medium mt-1 px-1"
                  >
                    Description is required
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        }}
      />

      {/* Actions Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 mt-6 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
          className="rounded-xl px-5 h-10 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all font-medium text-xs cursor-pointer"
        >
          Cancel
        </Button>

        <form.Subscribe
          selector={(state) => [state.canSubmit]}
          children={([canSubmit]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isPending}
              className="rounded-xl px-6 h-10 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create Transaction"}</span>
              )}
            </Button>
          )}
        />
      </div>
    </form>
  );
}

/* ==========================================================================
   Transfer Form Component
   ========================================================================== */
interface TransferFormProps {
  onClose: () => void;
}

function TransferForm({ onClose }: TransferFormProps) {
  const createTransferMutation = useCreateTransferMutation();
  const isPending = createTransferMutation.isPending;

  const { data: walletsRes } = useWalletsQuery();
  const walletsList = walletsRes?.data || [];

  const [txDate, setTxDate] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });

  const [amountInput, setAmountInput] = useState("");

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleChange: (v: number) => void
  ) => {
    const input = e.target;
    const rawVal = input.value;
    const selectionStart = input.selectionStart || 0;

    const valBeforeCursor = rawVal.substring(0, selectionStart);
    const digitsBeforeCursor = valBeforeCursor.replace(/\D/g, "").length;

    const cleanVal = rawVal.replace(/\D/g, "");
    const numericVal = cleanVal === "" ? null : Number(cleanVal);
    const formattedVal = cleanVal === "" ? "" : cleanVal.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    setAmountInput(formattedVal);
    handleChange(numericVal as unknown as number);

    requestAnimationFrame(() => {
      let newCursorPosition = 0;
      let digitCount = 0;
      for (let i = 0; i < formattedVal.length; i++) {
        if (digitCount === digitsBeforeCursor) {
          break;
        }
        if (/\d/.test(formattedVal[i])) {
          digitCount++;
        }
        newCursorPosition = i + 1;
      }
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };

  const form = useForm({
    defaultValues: {
      source_wallet_id: "",
      destination_wallet_id: "",
      amount: null as unknown as number,
      transaction_date: txDate,
    },
    validators: {
      onChange: transferSchema,
    },
    onSubmit: async ({ value }) => {
      createTransferMutation.mutate(value, {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="p-6 space-y-4 text-left"
    >
      <form.Subscribe
        selector={(state) => [state.values.source_wallet_id, state.values.destination_wallet_id]}
        children={([sourceWalletId, destinationWalletId]) => (
          <>
            {/* Source Wallet Field */}
            <form.Field
              name="source_wallet_id"
              children={(field) => {
                const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                const walletOptions = walletsList
                  .filter((w) => w.id !== destinationWalletId)
                  .map((w) => ({
                    value: w.id,
                    label: w.name,
                    sublabel: `Rp ${Math.round(Number(w.balance)).toLocaleString("id-ID")}`,
                  }));
                return (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                      From Wallet (Source)
                    </Label>
                    <CustomSelect
                      value={field.state.value}
                      onChange={field.handleChange}
                      options={walletOptions}
                      placeholder="Select Source Wallet"
                      icon={<Wallet className="size-4" />}
                      hasError={hasError}
                    />
                    {hasError && (
                      <p className="text-xs text-destructive font-medium mt-1 px-1">
                        Source wallet is required
                      </p>
                    )}
                  </div>
                );
              }}
            />

            {/* Visual Divider Connector */}
            <div className="flex items-center justify-center py-1">
              <div className="h-px bg-zinc-100 flex-1" />
              <div className="size-8 rounded-full border border-zinc-150 bg-white flex items-center justify-center text-zinc-400 shadow-sm shrink-0 select-none">
                <ArrowDown className="size-4" />
              </div>
              <div className="h-px bg-zinc-100 flex-1" />
            </div>

            {/* Destination Wallet Field */}
            <form.Field
              name="destination_wallet_id"
              children={(field) => {
                const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                const walletOptions = walletsList
                  .filter((w) => w.id !== sourceWalletId)
                  .map((w) => ({
                    value: w.id,
                    label: w.name,
                    sublabel: `Rp ${Math.round(Number(w.balance)).toLocaleString("id-ID")}`,
                  }));
                return (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                      To Wallet (Destination)
                    </Label>
                    <CustomSelect
                      value={field.state.value}
                      onChange={field.handleChange}
                      options={walletOptions}
                      placeholder="Select Destination Wallet"
                      icon={<Wallet className="size-4" />}
                      hasError={hasError}
                    />
                    {hasError && (
                      <p className="text-xs text-destructive font-medium mt-1 px-1">
                        {field.state.meta.errors[0]?.message || "Destination wallet is required"}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </>
        )}
      />

      {/* Amount and Date in a 2-column grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Amount Field */}
        <form.Field
          name="amount"
          children={(field) => {
            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                  Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 select-none font-medium">
                    Rp
                  </span>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={amountInput}
                    onBlur={field.handleBlur}
                    onChange={(e) => handleAmountChange(e, field.handleChange)}
                    placeholder="0"
                    className={cn(
                      "rounded-xl border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm",
                      hasError && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                <AnimatePresence>
                  {hasError && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="text-xs text-destructive font-medium mt-1 px-1"
                    >
                      {field.state.meta.errors[0]?.message || "Amount is required"}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          }}
        />

        {/* Date Field */}
        <form.Field
          name="transaction_date"
          children={(field) => {
            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                  Date
                </Label>
                <CustomDatePicker
                  value={txDate}
                  onChange={(val) => {
                    field.handleChange(val);
                    setTxDate(val);
                  }}
                  hasError={hasError}
                />
              </div>
            );
          }}
        />
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 mt-6 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
          className="rounded-xl px-5 h-10 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all font-medium text-xs cursor-pointer"
        >
          Cancel
        </Button>

        <form.Subscribe
          selector={(state) => [state.canSubmit]}
          children={([canSubmit]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isPending}
              className="rounded-xl px-6 h-10 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Transfer Funds</span>
              )}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
/* ==========================================================================
   Custom UI Dropdown Select Component
   ========================================================================== */
export interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; sublabel?: string }[];
  placeholder: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  hasError?: boolean;
  searchable?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  icon,
  disabled = false,
  hasError = false,
  searchable = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    } else if (searchable) {
      // Focus input automatically on open
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable]);

  const filteredOptions = options.filter((opt) => {
    return (
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full text-left focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 shadow-sm transition-all cursor-pointer disabled:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400 select-none",
          hasError && "border-destructive focus:ring-destructive focus:border-destructive",
          isOpen && "ring-1 ring-zinc-950 border-zinc-950"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {icon && <span className="text-zinc-400 shrink-0">{icon}</span>}
          {selectedOption ? (
            <div className="truncate">
              <span className="font-medium text-zinc-900">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-[10px] text-zinc-400 ml-1.5 select-none">
                  ({selectedOption.sublabel})
                </span>
              )}
            </div>
          ) : (
            <span className="text-zinc-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("size-4 text-zinc-400 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && !isMobile && (
        <>
          {/* Backdrop layer to click outside and dismiss */}
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
          {/* Dropdown Options Box */}
          <div className="absolute left-0 right-0 top-12.5 z-50 max-h-60 overflow-y-auto bg-white border border-zinc-150 rounded-xl p-1.5 shadow-lg flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
            {searchable && (
              <div className="px-2 py-1.5 sticky top-0 bg-white z-10 border-b border-zinc-100 mb-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-lg pl-8 pr-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
                  />
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-xs font-semibold text-zinc-450 select-none">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left py-2 px-3 text-sm font-medium rounded-lg transition-all cursor-pointer flex items-center justify-between gap-2",
                      isSelected
                        ? "bg-zinc-900 text-white font-semibold shadow-sm"
                        : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    <div className="truncate flex items-baseline gap-1.5">
                      <span>{opt.label}</span>
                      {opt.sublabel && (
                        <span className={cn(
                          "text-[10px] select-none font-medium",
                          isSelected ? "text-zinc-300" : "text-zinc-400"
                        )}>
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="size-4 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={placeholder}
        >
          <div className="flex flex-col gap-1.5 w-full">
            {searchable && (
              <div className="relative mb-2 px-1">
                <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-150 rounded-xl pl-11 pr-4 h-10 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 shadow-sm"
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="text-center py-6 text-sm font-semibold text-zinc-450 select-none">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left py-3.5 px-4 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 border border-transparent select-none",
                      isSelected
                        ? "bg-zinc-900 text-white font-bold shadow-md"
                        : "text-zinc-650 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-900"
                    )}
                  >
                    <div className="truncate flex items-baseline gap-2">
                      <span className="text-sm">{opt.label}</span>
                      {opt.sublabel && (
                        <span className={cn(
                          "text-xs select-none font-medium",
                          isSelected ? "text-zinc-300" : "text-zinc-400"
                        )}>
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="size-4.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

/* ==========================================================================
   Custom UI Date Picker Component
   ========================================================================== */
function CustomDatePicker({
  value,
  onChange,
  hasError = false,
}: {
  value: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
  hasError?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Parse current selected date
  const parsedDate = value ? new Date(value) : new Date();
  
  // Local calendar state (month & year we are viewing)
  const [viewingDate, setViewingDate] = useState(() => parsedDate);

  // Sync viewingDate with selected value when it changes
  useEffect(() => {
    if (value) {
      setTimeout(() => {
        setViewingDate(new Date(value));
      }, 0);
    }
  }, [value]);

  const year = viewingDate.getFullYear();
  const month = viewingDate.getMonth(); // 0-indexed

  // Format of selected date to display
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "Select Date";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Select Date";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calendar calculations
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create grid arrays
  const daysArray: (number | null)[] = [];
  // Padding for first week
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  // Month days
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const handlePrevMonth = () => {
    setViewingDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewingDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const targetDate = new Date(year, month, day);
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dd = String(targetDate.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full text-left focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 shadow-sm transition-all cursor-pointer select-none",
          hasError && "border-destructive focus:ring-destructive focus:border-destructive",
          isOpen && "ring-1 ring-zinc-950 border-zinc-950"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="size-4 text-zinc-400 shrink-0 pointer-events-none" />
          <span className="font-medium text-zinc-900">{formatDateLabel(value)}</span>
        </div>
        <ChevronDown className={cn("size-4 text-zinc-400 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && !isMobile && (
        <>
          {/* Backdrop layer to click outside and dismiss */}
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
          {/* Calendar Picker Card */}
          <div className="absolute right-0 top-12.5 z-50 w-72 bg-white border border-zinc-150 rounded-2xl p-4 shadow-lg flex flex-col gap-3 select-none animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Calendar Picker Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center size-7"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="font-bold text-xs.5 text-zinc-800">
                {monthNames[month]} {year}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center size-7"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysOfWeek.map((day) => (
                <span key={day} className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysArray.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} />;
                }
                
                const currentDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isSelected = value === currentDateStr;
                
                const today = new Date();
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      "size-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer relative",
                      isSelected
                        ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-850"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    {day}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 size-1 rounded-full bg-zinc-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Select Date"
        >
          <div className="flex justify-center w-full pb-4">
            <div className="w-72 bg-white flex flex-col gap-3 select-none">
              {/* Calendar Picker Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center size-7"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="font-bold text-xs.5 text-zinc-800">
                  {monthNames[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center size-7"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysOfWeek.map((day) => (
                  <span key={day} className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {day}
                  </span>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {daysArray.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} />;
                  }
                  
                  const currentDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isSelected = value === currentDateStr;
                  
                  const today = new Date();
                  const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={cn(
                        "size-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer relative",
                        isSelected
                          ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-850"
                          : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                      )}
                    >
                      {day}
                      {isToday && !isSelected && (
                        <span className="absolute bottom-1 size-1 rounded-full bg-zinc-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
