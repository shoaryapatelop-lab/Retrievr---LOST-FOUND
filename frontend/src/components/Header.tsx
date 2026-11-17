import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Search, User, LogOut, Menu, X, Bell, PlusCircle, ChevronDown,
  LayoutDashboard, ShieldCheck, PackageSearch, Package, Settings,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Accessories',
  'Clothing',
  'Bags',
  'Keys',
  'Other Items',
]

type MenuKey = 'report' | 'account' | null

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<MenuKey>(null)
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (category) params.set('category', category)
    navigate(`/search?${params.toString()}`)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    setOpenMenu(null)
    setMobileOpen(false)
    navigate('/')
  }

  const goCategory = (cat: string) => {
    navigate(`/search?category=${encodeURIComponent(cat)}`)
    setMobileOpen(false)
  }

  const toggleMenu = (key: MenuKey) => {
    setOpenMenu((cur) => (cur === key ? null : key))
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100 hover:text-ink-900'
    }`

  return (
    <header className="sticky top-0 z-50">
      {/* Utility strip */}
      <div className="hidden bg-ink-900 text-white md:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="text-white/70">Lost something? Let&apos;s bring it back.</p>
          <nav className="flex items-center gap-5">
            <Link to="/report/lost" className="text-white/80 transition-colors hover:text-white">
              Report Lost
            </Link>
            <Link to="/report/found" className="text-white/80 transition-colors hover:text-white">
              Report Found
            </Link>
            <Link to="/search" className="text-white/80 transition-colors hover:text-white">
              Browse Items
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 text-white/80 transition-colors hover:text-white"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`border-b bg-white/90 backdrop-blur transition-shadow duration-300 ${
          scrolled ? 'border-hairline shadow-nav' : 'border-transparent shadow-sm'
        }`}
      >
        <div className="container-page flex h-16 items-center gap-3 sm:gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-ink-800 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/assets/branding/retrievr-logo.png"
              alt="Retrievr logo"
              className="h-9 w-auto"
            />
          </Link>

          {/* Search */}
          <form onSubmit={runSearch} className="hidden flex-1 md:block" role="search">
            <div className="group flex w-full items-stretch overflow-hidden rounded-lg border border-hairline bg-white transition-all duration-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30">
              <div className="relative hidden sm:block">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Filter by category"
                  className="h-full appearance-none border-r border-hairline bg-gray-50 py-0 pl-3 pr-8 text-sm text-ink-800 focus:outline-none"
                >
                  <option value="">All</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lost or found items, brands, places…"
                  aria-label="Search items"
                  className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-ink-900 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Search
              </button>
            </div>
          </form>

          {/* Account actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            {/* Report dropdown */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => toggleMenu('report')}
                className="btn-accent"
                aria-haspopup="menu"
                aria-expanded={openMenu === 'report'}
              >
                <PlusCircle className="h-4 w-4" />
                Report item
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="relative rounded-lg p-2 text-ink-800 transition-colors hover:bg-gray-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Link>

                {/* Account dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleMenu('account')}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm font-medium text-ink-800 transition-colors hover:bg-gray-100"
                    aria-haspopup="menu"
                    aria-expanded={openMenu === 'account'}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                      {user.firstName?.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden max-w-[8rem] truncate sm:inline">{user.firstName}</span>
                    <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:inline" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:inline-flex">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Category nav row (desktop) */}
        <div className="hidden border-t border-hairline bg-white lg:block">
          <div className="container-page flex items-center gap-1 py-1.5">
            <NavLink to="/search" end className={navLinkClass}>
              All Items
            </NavLink>
            <span className="mx-1 h-5 w-px bg-hairline" />
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => goCategory(c)}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dropdown scrim (closes menus on outside click) */}
      <AnimatePresence>
        {openMenu && (
          <motion.button
            aria-label="Close menu"
            tabIndex={-1}
            className="fixed inset-0 top-[104px] z-40 cursor-default bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Report dropdown panel */}
      <AnimatePresence>
        {openMenu === 'report' && (
          <motion.div
            className="absolute right-[13rem] top-[6.2rem] z-50 hidden w-64 lg:block"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="card overflow-hidden p-1.5">
              <Link
                to="/report/lost"
                onClick={() => setOpenMenu(null)}
                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-red-50"
              >
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-lost">
                  <PackageSearch className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">Report a lost item</span>
                  <span className="block text-xs text-gray-500">I&apos;m missing something</span>
                </span>
              </Link>
              <Link
                to="/report/found"
                onClick={() => setOpenMenu(null)}
                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-emerald-50"
              >
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-found">
                  <Package className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">Report a found item</span>
                  <span className="block text-xs text-gray-500">I found something</span>
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account dropdown panel */}
      <AnimatePresence>
        {openMenu === 'account' && user && (
          <motion.div
            className="absolute right-4 top-[4.4rem] z-50 w-60 sm:right-6"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="card overflow-hidden">
              <div className="border-b border-hairline px-4 py-3">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="p-1.5">
                <Link
                  to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  onClick={() => setOpenMenu(null)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-800 transition-colors hover:bg-gray-100"
                >
                  <LayoutDashboard className="h-4 w-4 text-gray-500" /> Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setOpenMenu(null)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-800 transition-colors hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4 text-gray-500" /> Profile settings
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-800 transition-colors hover:bg-gray-100"
                  >
                    <ShieldCheck className="h-4 w-4 text-gray-500" /> Admin panel
                  </Link>
                )}
                <div className="my-1 h-px bg-hairline" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-lost transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-ink-900/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-[70] flex w-[86%] max-w-sm flex-col bg-white shadow-float lg:hidden"
              initial={reduce ? { opacity: 0 } : { x: '-100%' }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: '-100%' }}
              transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-hairline px-4 py-4">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <img
                    src="/assets/branding/retrievr-icon.png"
                    alt="Retrievr icon"
                    className="h-9 w-9"
                  />
                  <span className="font-display text-lg font-bold text-ink-900">Retrievr</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
                <form onSubmit={runSearch} className="flex overflow-hidden rounded-lg border border-hairline focus-within:border-primary-500">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search items…"
                      aria-label="Search items"
                      className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="bg-primary-600 px-4 text-sm font-semibold text-white">
                    Go
                  </button>
                </form>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/report/lost"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-lost"
                  >
                    <PackageSearch className="h-4 w-4" /> Report lost
                  </Link>
                  <Link
                    to="/report/found"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-found"
                  >
                    <Package className="h-4 w-4" /> Report found
                  </Link>
                </div>

                <div>
                  <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => goCategory('')}
                      className="rounded-lg border border-hairline px-3 py-2 text-left text-sm font-medium text-ink-800 hover:bg-gray-50"
                    >
                      All Items
                    </button>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => goCategory(c)}
                        className="rounded-lg border border-hairline px-3 py-2 text-left text-sm font-medium text-ink-800 hover:bg-gray-50"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-hairline p-4">
                {user ? (
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-800 hover:bg-gray-100"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-800 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-800 hover:bg-gray-100"
                      >
                        <ShieldCheck className="h-4 w-4" /> Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-lost hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary">
                      Log in
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}