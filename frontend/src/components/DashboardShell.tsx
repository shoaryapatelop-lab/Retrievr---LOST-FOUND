import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

export interface DashNavItem {
  key: string
  label: string
  icon: LucideIcon
  badge?: number
}

interface DashboardShellProps {
  nav: DashNavItem[]
  active: string
  onChange: (key: string) => void
  userName: string
  userRole: string
  title: string
  subtitle: string
  actions?: ReactNode
  children: ReactNode
}

export default function DashboardShell({
  nav,
  active,
  onChange,
  userName,
  userRole,
  title,
  subtitle,
  actions,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">{subtitle}</p>
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>

        {/* Mobile nav (horizontal scroll) */}
        <div className="mt-6 lg:hidden">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {nav.map((item) => {
              const isActive = active === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => onChange(item.key)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'border border-hairline bg-white text-ink-800'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-40 space-y-4">
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 font-display text-base font-bold text-primary-700">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userRole}</p>
                  </div>
                </div>
              </div>

              <nav className="card p-2">
                <ul className="space-y-1">
                  {nav.map((item) => {
                    const isActive = active === item.key
                    return (
                      <li key={item.key}>
                        <button
                          onClick={() => onChange(item.key)}
                          className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive ? 'text-primary-700' : 'text-ink-800 hover:bg-gray-50'
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="dash-active-pill"
                              className="absolute inset-0 rounded-lg bg-primary-50"
                              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            />
                          )}
                          <span className="relative flex items-center gap-2.5">
                            <item.icon className={`h-4 w-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                            {item.label}
                            {typeof item.badge === 'number' && item.badge > 0 && (
                              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-100 px-1 text-[11px] font-bold text-primary-700">
                                {item.badge}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <div className="card space-y-1 p-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-800 transition-colors hover:bg-gray-50"
                >
                  Profile settings
                </Link>
                <Link
                  to="/"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-800 transition-colors hover:bg-gray-50"
                >
                  Back to site
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}