import { apiFetch } from "@/lib/http";
import type { DashboardSummaryData } from "./dashboard.contract";

export async function getDashboardSummary(params?: { month_year?: string }) {
  return await apiFetch<DashboardSummaryData>("/dashboard/summary", {
    method: "GET",
    params,
  });
}
