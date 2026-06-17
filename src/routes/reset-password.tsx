import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/reset-password')({
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/',
      search: {
        mode: 'reset-password',
        token: search.token,
      },
    })
  },
})
