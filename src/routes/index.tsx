import { createFileRoute } from '@tanstack/react-router'
import { LoginView } from '@/features/auth/views/login.view'
import { z } from 'zod'
import { redirectIfAuthenticated } from '@/lib/auth-middleware'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(['login', 'register', 'forgot-password', 'reset-password']).optional(),
  token: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: loginSearchSchema,
  loader: redirectIfAuthenticated,
  component: LoginView,
})
