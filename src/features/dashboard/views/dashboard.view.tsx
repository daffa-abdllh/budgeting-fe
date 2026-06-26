import { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useDashboardSummaryQuery } from "../api/dashboard.queries";
import { formatCurrency, cn, getDefaultMonthYear } from "@/lib/utils";
import { Route as AuthRoute } from "@/routes/_auth";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
  AlertCircle,
  Inbox,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion } from "motion/react";

function getCycleDateRange(monthYear: string, salaryDay: number): { startDate: Date; endDate: Date } {
  const [yearStr, monthStr] = monthYear.split("-");
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1; // 0-indexed month

  if (salaryDay === 1) {
    const startDateObj = new Date(Date.UTC(year, monthIndex, 1));
    const endDateObj = new Date(Date.UTC(year, monthIndex + 1, 0));
    return { startDate: startDateObj, endDate: endDateObj };
  }

  let prevMonthIndex = monthIndex - 1;
  let prevYear = year;
  if (prevMonthIndex < 0) {
    prevMonthIndex = 11;
    prevYear -= 1;
  }

  let startDateObj = new Date(Date.UTC(prevYear, prevMonthIndex, salaryDay));
  const actualStartMonth = startDateObj.getUTCMonth();
  if (actualStartMonth !== prevMonthIndex) {
    startDateObj = new Date(Date.UTC(prevYear, prevMonthIndex + 1, 0));
  }

  let currentSalaryDayObj = new Date(Date.UTC(year, monthIndex, salaryDay));
  const actualCurrentMonth = currentSalaryDayObj.getUTCMonth();
  if (actualCurrentMonth !== monthIndex) {
    currentSalaryDayObj = new Date(Date.UTC(year, monthIndex + 1, 0));
  }

  const endDateObj = new Date(currentSalaryDayObj.getTime() - 24 * 60 * 60 * 1000);

  return { startDate: startDateObj, endDate: endDateObj };
}

function formatCyclePeriod(monthYear: string, salaryDay: number): string {
  const { startDate, endDate } = getCycleDateRange(monthYear, salaryDay);
  
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  };

  return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`;
}

export function DashboardView() {
  const user = AuthRoute.useLoaderData();
  const search = useSearch({ strict: false }) as Record<string, string | undefined>;
  const navigate = useNavigate();

  // Active month_year state from search params (defaults based on payday)
  const currentMonthYear = getDefaultMonthYear(user?.salary_day ?? 1);
  const activeMonthYear = search.month_year || currentMonthYear;

  // Fetch dashboard summary
  const { data: response, isLoading, isError, error, refetch } = useDashboardSummaryQuery({
    month_year: activeMonthYear,
  });

  const dashboardData = response?.data;

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
    navigate({
      to: "/dashboard",
      search: {
        month_year: newMonthYear === currentMonthYear ? undefined : newMonthYear,
      },
    });
    setIsPopoverOpen(false);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 border border-dashed border-red-200 bg-red-50/10 rounded-2xl text-center max-w-2xl mx-auto my-12">
        <AlertCircle className="size-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 mb-1">Failed to load dashboard data</h3>
        <p className="text-sm text-zinc-500 mb-4">{(error as Error)?.message || "Something went wrong."}</p>
        <button
          onClick={() => refetch()}
          className="rounded-full px-6 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse text-left">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-40 bg-zinc-200 rounded-lg" />
            <div className="h-4 w-60 bg-zinc-200 rounded-lg" />
          </div>
          <div className="h-10 w-44 bg-zinc-200 rounded-lg" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-zinc-250/60 rounded-2xl p-5" />
          ))}
        </div>

        {/* Grid Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <div className="h-64 bg-white border border-zinc-250/60 rounded-2xl p-6" />
            <div className="h-48 bg-white border border-zinc-250/60 rounded-2xl p-6" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-80 bg-white border border-zinc-250/60 rounded-2xl p-6" />
          </div>
        </div>
      </div>
    );
  }

  const {
    total_net_worth = 0,
    difference = 0,
    monthly_cashflow = { income: 0, expense: 0, ending_balance: 0, unallocated_amount: 0 },
    budget_summary = [],
    expense_by_wallet = [],
    upcoming_reminders = [],
  } = dashboardData || {};

  return (
    <div className="space-y-8 text-left">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Overview</h1>
          <p className="text-sm text-zinc-500 mt-1 select-none">
            Welcome back, <span className="font-semibold text-zinc-800">{user?.name}</span>. Here is your financial summary.
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 select-none bg-zinc-100 border border-zinc-150 rounded-lg px-2.5 py-1 w-max">
            <Calendar className="size-3.5 text-zinc-400" />
            <span>Cycle: {formatCyclePeriod(activeMonthYear, user?.salary_day ?? 1)}</span>
          </div>
        </div>

        {/* Calendar Picker Selector Popover */}
        <div className="relative self-start md:self-auto select-none">
          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={cn(
              "flex items-center justify-between gap-2.5 bg-white border border-zinc-200 rounded-xl px-4 h-10 shadow-sm text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-all select-none cursor-pointer w-full md:w-auto",
              isPopoverOpen && "ring-1 ring-zinc-950 border-zinc-950"
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-zinc-400" />
              <span>{formattedActiveMonthYear}</span>
            </div>
            <ChevronDown className={cn("size-3.5 text-zinc-400 transition-transform duration-200", isPopoverOpen && "rotate-180")} />
          </button>

          {isPopoverOpen && (
            <>
              {/* Invisible backdrop to dismiss popover */}
              <div className="fixed inset-0 z-20 cursor-default" onClick={() => setIsPopoverOpen(false)} />
              
              {/* Calendar Month/Year popover panel */}
              <div className="absolute left-0 md:left-auto md:right-0 top-11.5 z-30 w-72 bg-white border border-zinc-150 rounded-2xl p-4 shadow-lg flex flex-col gap-3 select-none animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                  <button
                    onClick={handlePrevYear}
                    className="p-1.5 rounded-lg hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center size-7"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="font-bold text-sm text-zinc-800">{viewingYear}</span>
                  <button
                    onClick={handleNextYear}
                    className="p-1.5 rounded-lg hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center size-7"
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
                        className={cn(
                          "py-2.5 px-1 text-xs rounded-xl font-medium transition-all cursor-pointer text-center relative border-0",
                          isSelected
                            ? "bg-zinc-900 text-white font-semibold shadow-sm hover:bg-zinc-850"
                            : "text-zinc-655 hover:bg-zinc-50 hover:text-zinc-900 bg-transparent"
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
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Net Worth Card */}
        <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase select-none">Total Net Worth</span>
              <h3 className="text-xl font-bold text-zinc-900">{formatCurrency(total_net_worth)}</h3>
            </div>
            <div className="size-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
              <Wallet className="size-5 text-zinc-600" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 select-none">
            {difference !== 0 ? (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-red-650 bg-red-50/50 border border-red-150/50 rounded-lg px-2.5 py-0.5">
                <AlertCircle className="size-3 shrink-0" />
                <span>Selisih: {formatCurrency(difference)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50/30 border border-emerald-100/50 rounded-lg px-2.5 py-0.5">
                <Check className="size-3 shrink-0" />
                <span>Fully Reconciled</span>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase select-none">Income</span>
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-bold text-emerald-600">
                {monthly_cashflow.income > 0 ? "+" : ""}
                {formatCurrency(monthly_cashflow.income)}
              </h3>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-emerald-50/50 border border-emerald-100/50 flex items-center justify-center">
            <TrendingUp className="size-5 text-emerald-600" />
          </div>
        </div>

        {/* Monthly Expense Card */}
        <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase select-none">Expenses</span>
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-bold text-red-600">
                {monthly_cashflow.expense > 0 ? "-" : ""}
                {formatCurrency(monthly_cashflow.expense)}
              </h3>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-red-50/50 border border-red-100/50 flex items-center justify-center">
            <TrendingDown className="size-5 text-red-600" />
          </div>
        </div>

        {/* Ending Balance Card */}
        <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase select-none">Ending Balance</span>
            <h3 className={`text-xl font-bold ${monthly_cashflow.ending_balance >= 0 ? 'text-zinc-900' : 'text-red-600'}`}>
              {formatCurrency(monthly_cashflow.ending_balance)}
            </h3>
          </div>
          <div className="size-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
            <PiggyBank className="size-5 text-zinc-600" />
          </div>
        </div>

      </div>

      {/* Main 2-Column Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Budgets and Wallets breakdown (col-span-7) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Budget Summary Section */}
          <div className="bg-white border border-zinc-150 rounded-2xl shadow-sm h-[380px] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between select-none shrink-0">
              <div>
                <h3 className="font-semibold text-zinc-900">Budget Utilization</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Track your category budget status</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Sisa Anggaran</span>
                <p className={cn(
                  "text-sm font-bold mt-0.5",
                  monthly_cashflow.unallocated_amount === 0
                    ? "text-zinc-500"
                    : monthly_cashflow.unallocated_amount > 0
                      ? "text-emerald-600"
                      : "text-red-600"
                )}>
                  {formatCurrency(monthly_cashflow.unallocated_amount)}
                </p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {budget_summary.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full border border-dashed border-zinc-200 rounded-xl bg-zinc-50/40 select-none">
                  <Inbox className="size-8 text-zinc-300 mb-2" />
                  <p className="text-xs font-medium text-zinc-500">No active budgets set for this month</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {budget_summary.map((item) => {
                    // Capped percentage representation
                    const displayPercent = Math.min(item.percentage, 100);
                    // Smart progress bar color triggers
                    let barColor = "bg-emerald-500";
                    let bgTint = "bg-emerald-50";
                    if (item.percentage >= 90) {
                      barColor = "bg-red-500";
                      bgTint = "bg-red-50";
                    } else if (item.percentage >= 70) {
                      barColor = "bg-amber-500";
                      bgTint = "bg-amber-50";
                    }

                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-zinc-800">{item.category}</span>
                          <span className="text-zinc-500 text-xs">
                            <span className="font-semibold text-zinc-800">{formatCurrency(item.spent)}</span>
                            {" / "}
                            {formatCurrency(item.budget)}
                          </span>
                        </div>
                        {/* Progress Tracker Bar */}
                        <div className="relative h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${displayPercent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${barColor}`}
                          />
                        </div>
                        {/* Budget warning/limit badge */}
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold select-none ${bgTint} ${barColor.replace("bg-", "text-")}`}>
                            {item.percentage}% used
                          </span>
                          {item.percentage > 100 && (
                            <span className="text-[10px] text-red-500 font-semibold flex items-center gap-1 select-none">
                              Over budget by {formatCurrency(item.spent - item.budget)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Expense by Wallet Section */}
          <div className="bg-white border border-zinc-150 rounded-2xl shadow-sm h-[380px] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 select-none shrink-0">
              <h3 className="font-semibold text-zinc-900">Expenses by Wallet</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Where your funds were spent from</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {expense_by_wallet.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full border border-dashed border-zinc-200 rounded-xl bg-zinc-50/40 select-none">
                  <Inbox className="size-8 text-zinc-300 mb-2" />
                  <p className="text-xs font-medium text-zinc-500">No expenses recorded from any wallet</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {expense_by_wallet.map((wallet) => (
                    <div key={wallet.wallet_id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600">
                          <Wallet className="size-4.5" />
                        </div>
                        <span className="text-sm font-semibold text-zinc-800">{wallet.wallet_name}</span>
                      </div>
                      <span className="text-sm font-bold text-zinc-950">{formatCurrency(wallet.spent)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Upcoming reminders & action alerts (col-span-5) */}
        <div className="lg:col-span-5">
          
          {/* Upcoming Bills Card */}
          <div className="bg-white border border-zinc-150 rounded-2xl shadow-sm h-[380px] lg:h-full flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 select-none shrink-0">
              <h3 className="font-semibold text-zinc-900">Upcoming Bills</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Bills due for this month</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {upcoming_reminders.length === 0 ? (
                <div className="flex-col items-center justify-center h-full border border-dashed border-zinc-200 rounded-xl bg-zinc-50/40 select-none flex">
                  <Bell className="size-8 text-zinc-300 mb-2" />
                  <p className="text-xs font-medium text-zinc-500">No upcoming bills this month</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming_reminders.map((reminder) => {
                    const formattedDueDate = new Date(reminder.due_date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <div
                        key={reminder.id}
                        className="flex items-center gap-3.5 p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/20 hover:bg-zinc-50/50 transition-colors"
                      >
                        <div className="size-9.5 rounded-full bg-zinc-100 border border-zinc-150 flex items-center justify-center text-zinc-500 shrink-0">
                          <Calendar className="size-4.5" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="text-sm font-semibold text-zinc-800 truncate">{reminder.description}</h4>
                          <span className="text-xs text-zinc-400 select-none">Due {formattedDueDate}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-zinc-950">{formatCurrency(reminder.amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
