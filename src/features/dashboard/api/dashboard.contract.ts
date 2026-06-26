import { z } from "zod";

export const dashboardSummaryInputSchema = z.object({
  month_year: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM").optional(),
});

export type DashboardSummaryInput = z.infer<typeof dashboardSummaryInputSchema>;

export interface BudgetSummaryItem {
  id: string;
  category: string;
  budget: number;
  spent: number;
  percentage: number;
}

export interface ExpenseByWalletItem {
  wallet_id: string;
  wallet_name: string;
  spent: number;
}

export interface UpcomingReminderItem {
  id: string;
  description: string;
  amount: number;
  day_of_month: number;
  due_date: string;
}

export interface DashboardSummaryData {
  month_year: string;
  total_net_worth: number;
  difference: number;
  monthly_cashflow: {
    income: number;
    expense: number;
    ending_balance: number;
    unallocated_amount: number;
  };
  budget_summary: BudgetSummaryItem[];
  expense_by_wallet: ExpenseByWalletItem[];
  upcoming_reminders: UpcomingReminderItem[];
}
