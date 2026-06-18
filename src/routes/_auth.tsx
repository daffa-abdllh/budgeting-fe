/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { createFileRoute, redirect, Outlet, Link } from '@tanstack/react-router'
import { getUserinfo } from '@/features/auth/api/auth.api'
import { useLogoutMutation } from '@/features/auth/api/auth.mutations'
import { LayoutDashboard, Wallet, PiggyBank, Bell, LogOut, Menu, X, ArrowUpDown, Settings } from 'lucide-react'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { SalaryDayDialog } from '@/features/auth/components/salary-day-dialog'
import { LogoutConfirmDialog } from '@/features/auth/components/logout-confirm-dialog'

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
  component: AuthLayout,
})

function AuthLayout() {
  const user = Route.useLoaderData()
  const logoutMutation = useLogoutMutation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  const navItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      isPlaceholder: false,
    },
    {
      label: 'Transactions',
      to: '/transactions',
      icon: ArrowUpDown,
      isPlaceholder: false,
    },
    {
      label: 'Wallets',
      to: '/wallets',
      icon: Wallet,
      isPlaceholder: false,
    },
    {
      label: 'Budgets',
      to: '/budgets',
      icon: PiggyBank,
      isPlaceholder: false,
    },
    {
      label: 'Reminders',
      to: '/reminders',
      icon: Bell,
      isPlaceholder: false,
    },
  ]

  const handlePlaceholderClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault()
    toast.info(`${label} feature is coming soon!`, {
      position: 'bottom-right',
      autoClose: 3000,
    })
  }

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true)
  }

  const handleConfirmLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setIsLogoutConfirmOpen(false)
      }
    })
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-zinc-150 p-6">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-white text-sm select-none">
          B
        </div>
        <span className="font-semibold text-zinc-900 text-sm tracking-tight">Budgeting</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          if (item.isPlaceholder) {
            return (
              <a
                key={item.label}
                href="#"
                onClick={(e) => handlePlaceholderClick(e, item.label)}
                className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all cursor-pointer"
              >
                <Icon className="size-4.5" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] bg-zinc-100 text-zinc-500 font-semibold px-2 py-0.5 rounded-full select-none">Soon</span>
              </a>
            )
          }

          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all cursor-pointer"
              activeProps={{
                className: "bg-zinc-900 !text-white hover:bg-zinc-900 hover:!text-white shadow-sm font-semibold"
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("size-4.5", isActive ? "text-white" : "text-zinc-400")} />
                  <span>{item.label}</span>
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section / Logout */}
      <div className="pt-4 border-t border-zinc-100 mt-auto space-y-4">
        <div className="flex items-center justify-between px-2 select-none">
          <div className="flex flex-col text-left min-w-0 flex-1">
            <span className="text-sm font-semibold text-zinc-800 truncate">{user?.name}</span>
            <span className="text-xs text-zinc-400 truncate">{user?.email}</span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer shrink-0 ml-2"
            title="Settings"
          >
            <Settings className="size-4.5" />
          </button>
        </div>

        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center justify-center gap-2.5 px-4 h-10 text-xs font-semibold rounded-xl border border-red-400 text-red-650 bg-red-50/20 hover:bg-red-50 hover:text-red-750 disabled:opacity-50 transition-all cursor-pointer"
        >
          <LogOut className="size-4 text-red-400" />
          <span className="text-red-400">{logoutMutation.isPending ? 'Logging out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50/30 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Top bar for Mobile */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-150 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7.5 h-7.5 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-white text-xs select-none">
            B
          </div>
          <span className="font-semibold text-zinc-900 text-sm tracking-tight">Budgeting</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile Drawer Sidebar Navigation overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-64 max-w-[80vw] bg-white z-40 md:hidden shadow-xl"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 md:p-8">
        <Outlet />
      </main>

      {/* Salary Day Settings Dialog */}
      <SalaryDayDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        isPending={logoutMutation.isPending}
      />
    </div>
  )
}
