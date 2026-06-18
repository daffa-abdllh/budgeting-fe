import { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useBudgetsQuery } from "../api/budget.queries";
import { BudgetFormDialog } from "../components/budget-form-dialog";
import { BudgetDeleteDialog } from "../components/budget-delete-dialog";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Calendar,
  PiggyBank,
  Check,
  TrendingUp,
} from "lucide-react";
import type { Budget, BudgetSummary } from "../api/budget.contract";

export function BudgetView() {
  const search = useSearch({ strict: false }) as Record<string, string | number | undefined>;
  const navigate = useNavigate();

  // Extract pagination values from search parameters
  const page = Number(search.page) || 1;
  const limit = Number(search.limit) || 10;

  // Active month_year state from search params (defaults to current month)
  const currentMonthYear = new Date().toISOString().substring(0, 7); // YYYY-MM
  const activeMonthYear = (search.month_year as string) || currentMonthYear;

  // Fetch budgets list
  const { data: response, isLoading, isError, error, refetch } = useBudgetsQuery({
    page,
    limit,
    month_year: activeMonthYear,
  });
  const budgets = response?.data || [];
  const pagination = response?.pagination;
  const summary = response?.meta?.summary as BudgetSummary | undefined;

  // Modal Dialog local states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const activeYear = activeMonthYear.substring(0, 4);
  const activeMonth = activeMonthYear.substring(5, 7);

  // Popover calendar states
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [viewingYear, setViewingYear] = useState(parseInt(activeYear));

  // Sync viewingYear with activeYear when activeYear changes in URL
  const [lastActiveYear, setLastActiveYear] = useState(activeYear);
  if (activeYear !== lastActiveYear) {
    setLastActiveYear(activeYear);
    setViewingYear(parseInt(activeYear));
  }

  // Get current date values for highlighting "today" indicator
  const today = new Date();
  const todayYear = String(today.getFullYear());
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0");

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

  // Helper to format title (e.g. "June 2026")
  const activeMonthLabel = monthOptions.find((m) => m.value === activeMonth)?.label || "";
  const formattedActiveMonthYear = `${activeMonthLabel} ${activeYear}`;

  const handlePrevYear = () => {
    setViewingYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setViewingYear((prev) => prev + 1);
  };

  const handleSelectMonth = (monthVal: string) => {
    const newMonthYear = `${viewingYear}-${monthVal}`;
    void navigate({
      to: "/budgets",
      search: {
        page: 1, // reset page
        limit,
        month_year: newMonthYear,
      },
    });
    setIsPopoverOpen(false);
  };

  const handleAddClick = () => {
    setSelectedBudget(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteOpen(true);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      void navigate({
        to: "/budgets",
        search: {
          page: page - 1,
          limit,
          month_year: activeMonthYear,
        },
      });
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      void navigate({
        to: "/budgets",
        search: {
          page: page + 1,
          limit,
          month_year: activeMonthYear,
        },
      });
    }
  };

  const formatMonthYear = (my: string) => {
    if (!my || !my.includes("-")) return my;
    const parts = my.split("-");
    let y, m;
    if (parts[0].length === 4) {
      y = parts[0];
      m = parts[1];
    } else {
      m = parts[0];
      y = parts[1];
    }
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 border border-dashed border-red-200 bg-red-50/10 rounded-2xl text-center max-w-2xl mx-auto my-12 animate-in fade-in">
        <AlertCircle className="size-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 mb-1">Failed to load budgets</h3>
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Monthly Budgets</h1>
          <p className="text-sm text-zinc-500 mt-1 select-none">
            Set and monitor category limits to manage your monthly spending.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto select-none">
          {/* Calendar Picker Popover */}
          <div className="relative self-start md:self-auto select-none">
            <button
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className="flex items-center gap-2.5 bg-white border border-zinc-200 rounded-xl px-4 h-11 shadow-sm text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-all select-none cursor-pointer"
            >
              <Calendar className="size-4 text-zinc-400" />
              <span>{formattedActiveMonthYear}</span>
            </button>

            {isPopoverOpen && (
              <>
                {/* Invisible backdrop to dismiss popover */}
                <div className="fixed inset-0 z-20 cursor-default" onClick={() => setIsPopoverOpen(false)} />

                {/* Calendar Month/Year popover panel */}
                <div className="absolute left-0 md:left-auto md:right-0 top-12 z-30 w-72 bg-white border border-zinc-150 rounded-2xl p-4 shadow-lg">
                  {/* Popover Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
                    <button
                      onClick={handlePrevYear}
                      className="p-1.5 rounded-lg hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="font-bold text-sm text-zinc-800">{viewingYear}</span>
                    <button
                      onClick={handleNextYear}
                      className="p-1.5 rounded-lg hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>

                  {/* Months Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {monthOptions.map((month) => {
                      const isSelected = activeYear === String(viewingYear) && activeMonth === month.value;
                      const isToday = todayYear === String(viewingYear) && todayMonth === month.value;

                      return (
                        <button
                          key={month.value}
                          onClick={() => handleSelectMonth(month.value)}
                          className={`py-2.5 px-1 text-xs rounded-xl font-medium transition-all cursor-pointer text-center relative
                            ${isSelected
                              ? "bg-zinc-900 text-white font-semibold shadow-sm"
                              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                            }
                          `}
                        >
                          {month.shortLabel}
                          {isToday && !isSelected && (
                            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-zinc-900" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleAddClick}
            className="rounded-xl px-5 h-11 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="size-4" />
            <span>Add Budget</span>
          </button>
        </div>
      </div>

      {/* Zero-Based Budgeting Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-in fade-in duration-300">
          {/* Income Card */}
          <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase select-none">Monthly Income</span>
              <h3 className="text-xl font-bold text-emerald-600">
                {formatCurrency(summary.total_income)}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-emerald-50/50 border border-emerald-100/50 flex items-center justify-center">
              <TrendingUp className="size-5 text-emerald-600" />
            </div>
          </div>

          {/* Allocated Card */}
          <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase select-none">Total Allocated</span>
              <h3 className="text-xl font-bold text-zinc-900">
                {formatCurrency(summary.total_allocated)}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
              <PiggyBank className="size-5 text-zinc-600" />
            </div>
          </div>

          {/* Unallocated / Zero-Based Check Card */}
          <div className={cn(
            "border rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all duration-300",
            summary.unallocated_amount === 0
              ? "bg-emerald-50/20 border-emerald-250"
              : summary.unallocated_amount > 0
                ? "bg-amber-50/20 border-amber-250"
                : "bg-red-50/20 border-red-250"
          )}>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase select-none">Unallocated</span>
              <h3 className={cn(
                "text-xl font-bold",
                summary.unallocated_amount === 0
                  ? "text-emerald-600"
                  : summary.unallocated_amount > 0
                    ? "text-amber-600"
                    : "text-red-650"
              )}>
                {formatCurrency(summary.unallocated_amount)}
              </h3>
            </div>
            <div className={cn(
              "size-10 rounded-xl flex items-center justify-center",
              summary.unallocated_amount === 0
                ? "bg-emerald-50 border border-emerald-100 text-emerald-600"
                : summary.unallocated_amount > 0
                  ? "bg-amber-50 border border-amber-100 text-amber-600"
                  : "bg-red-50 border border-red-100 text-red-650"
            )}>
              {summary.unallocated_amount === 0 ? (
                <Check className="size-5" />
              ) : (
                <AlertCircle className="size-5" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content (List / Grid) */}
      {isLoading ? (
        // Pulsing Loading Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4 justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-14 bg-zinc-200 rounded-lg shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-zinc-200 rounded-md" />
                  <div className="h-3 w-24 bg-zinc-200 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-16 bg-zinc-200 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        // Empty State Banner
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-250/70 rounded-2xl bg-white shadow-xs max-w-xl mx-auto text-center select-none animate-in fade-in duration-300">
          <div className="size-14 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
            <FolderOpen className="size-6.5" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 mb-1">No budgets found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
            You haven't set up any monthly budgets yet. Create budgets for categories like Food, Fuel, or Entertainment to control your spendings.
          </p>
          <button
            onClick={handleAddClick}
            className="rounded-xl px-6 h-10 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="size-4" />
            <span>Create First Budget</span>
          </button>
        </div>
      ) : (
        // Budgets Table
        <div className="overflow-x-auto border border-zinc-150 bg-white rounded-2xl shadow-xs animate-in fade-in duration-400">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-150 bg-zinc-50/30">
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Category</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Period</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Limit Amount</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Spent</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Remaining</th>
                <th className="px-6 py-4.5 text-[10px] font-bold text-zinc-400 tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {budgets.map((budget) => {
                const formattedAmount = formatCurrency(Number(budget.amount) || 0);
                const spent = Number(budget.spent) || 0;
                const remaining = Number(budget.remaining) || 0;
                const formattedSpent = formatCurrency(spent);
                const formattedRemaining = formatCurrency(remaining);
                const percentUsed = budget.amount > 0 ? Math.min(Math.round((spent / budget.amount) * 100), 100) : 0;

                return (
                  <tr key={budget.id} className="hover:bg-zinc-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-500 shrink-0">
                          <PiggyBank className="size-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 text-sm">
                            {budget.category}
                          </span>
                          {/* Mini Utilization Indicator */}
                          <div className="flex items-center gap-1.5 mt-1 select-none">
                            <div className="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${percentUsed}%` }}
                                className={cn(
                                  "h-full rounded-full",
                                  percentUsed >= 90
                                    ? "bg-red-500"
                                    : percentUsed >= 70
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                )}
                              />
                            </div>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {percentUsed}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-500 text-sm font-medium">
                        {formatMonthYear(budget.month_year)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-zinc-900 text-sm">
                        {formattedAmount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-zinc-700 text-sm">
                        {formattedSpent}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "font-bold text-sm",
                        remaining < 0 ? "text-red-650" : "text-zinc-900"
                      )}>
                        {formattedRemaining}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditClick(budget)}
                          className="size-8 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                          title="Edit Budget"
                        >
                          <Pencil className="size-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteClick(budget)}
                          className="size-8 rounded-lg bg-red-50/30 hover:bg-red-50 border border-red-100/70 text-red-500 hover:text-red-700 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                          title="Delete Budget"
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
      {!isLoading && budgets.length > 0 && pagination && (
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

      {/* Dialog Modals */}
      <BudgetFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        budget={selectedBudget}
      />

      <BudgetDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        budget={selectedBudget}
      />
    </div>
  );
}
