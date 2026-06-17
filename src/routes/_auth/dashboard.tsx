/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useLogoutMutation } from '@/features/auth/api/auth.mutations'
import { Route as AuthRoute } from '../_auth'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPlaceholder,
})

function DashboardPlaceholder() {
  const user = AuthRoute.useLoaderData()
  const logoutMutation = useLogoutMutation()

  return (
    <div className="p-6 space-y-4 text-left">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {user?.name} ({user?.email})</p>
      <p>This is a simple text-only dashboard page.</p>
      <Button
        variant="destructive"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        Logout
      </Button>
    </div>
  )
}
export default DashboardPlaceholder;
