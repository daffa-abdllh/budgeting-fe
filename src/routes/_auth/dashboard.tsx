import { createFileRoute } from '@tanstack/react-router'
import { DashboardView } from '@/features/dashboard/views/dashboard.view'
import { dashboardSummaryInputSchema } from '@/features/dashboard/api/dashboard.contract'

export const Route = createFileRoute('/_auth/dashboard')({
  validateSearch: dashboardSummaryInputSchema,
  component: DashboardView,
})
