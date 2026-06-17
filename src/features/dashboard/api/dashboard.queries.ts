import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "./dashboard.api";

export const DASHBOARD_SUMMARY_QUERY_KEY = ["dashboard", "summary"];

export function useDashboardSummaryQuery(params?: { month_year?: string }) {
  return useQuery({
    queryKey: [...DASHBOARD_SUMMARY_QUERY_KEY, params],
    queryFn: () => getDashboardSummary(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}
