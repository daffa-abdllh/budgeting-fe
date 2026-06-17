import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { getUserinfo } from '@/features/auth/api/auth.api'

export const Route = createFileRoute('/_auth')({
  loader: async ({ location }) => {
    let user = null;
    try {
      const response = await getUserinfo();
      if (response && response.status === 'success') {
        user = response.data;
      }
    } catch {
      // Sesi tidak valid, biarkan ditangani oleh pengecekan di bawah
    }

    if (!user) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.pathname,
        },
      });
    }

    return user;
  },
  component: () => <Outlet />,
})
