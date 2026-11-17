import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Search, Recycle, CheckCircle2, Sparkles } from 'lucide-react'

const highlights = [
  { icon: Search, text: 'Search thousands of lost & found reports in one place.' },
  { icon: Recycle, text: 'Smart matching pairs lost items with found ones automatically.' },
  { icon: ShieldCheck, text: 'Admin-verified claims keep every hand-off safe.' },
]

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-ink-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 bg-grid-faint-light opacity-40"
          style={{ backgroundSize: '26px 26px' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-600/30 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 font-display text-lg font-bold text-white">
              R
            </span>
            <span className="font-display text-2xl font-bold">Retrievr</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-md"
        >
          <span className="eyebrow text-accent-400">
            <Sparkles className="h-3.5 w-3.5" /> Lost &amp; Found, reimagined
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-balance xl:text-4xl">
            Lost something? Let&apos;s bring it back.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent-400">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm leading-relaxed text-white/75">{text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="relative flex items-center gap-2 text-xs text-white/50">
          <CheckCircle2 className="h-4 w-4 text-found" /> Trusted by campus communities
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 font-display text-lg font-bold text-white">
              R
            </span>
            <span className="font-display text-xl font-bold text-ink-900">Retrievr</span>
          </div>

          <div className="card p-6 sm:p-8">
            <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h1>
            <div className="mt-2 text-sm text-gray-600">{subtitle}</div>
            <div className="mt-6">{children}</div>
          </div>

          {footer && <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>}
        </motion.div>
      </main>
    </div>
  )
}