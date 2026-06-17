import { redirect } from '@tanstack/react-router'
import { getUserinfo } from '@/features/auth/api/auth.api'

export async function redirectIfAuthenticated() {
  let isAuthenticated = false;
  try {
    const response = await getUserinfo();
    if (response && response.status === 'success') {
      isAuthenticated = true;
    }
  } catch {
    // Sesi tidak valid / belum login, biarkan mengakses halaman guest
  }

  if (isAuthenticated) {
    throw redirect({ to: '/dashboard' });
  }
}
