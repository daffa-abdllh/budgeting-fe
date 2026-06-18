import { z } from "zod";

export const budgetSchema = z.object({
  category: z.string().min(1, "Category is required").max(100, "Category name is too long"),
  amount: z.number({ message: "Amount is required" }).min(0, "Amount cannot be negative"),
  month_year: z.string().regex(/^\d{4}-\d{2}$/, "Month/Year must be in YYYY-MM format"),
});

export type CreateBudgetInput = z.infer<typeof budgetSchema>;
export type UpdateBudgetInput = z.infer<typeof budgetSchema>;

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month_year: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  spent?: number;
  remaining?: number;
}

export interface BudgetSummary {
  month_year: string;
  total_income: number;
  total_allocated: number;
  unallocated_amount: number;
}

export interface GetBudgetsResponse {
  data: Budget[];
  pagination: {
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}
