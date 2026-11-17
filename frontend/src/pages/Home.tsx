import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Search, ArrowRight, Package, PackageSearch, ShieldCheck, Recycle,
  Smartphone, FileText, Glasses, Shirt, Backpack, Key, Boxes, Sparkles,
  CheckCircle2, MapPin, Star, Link2, Bell,
} from 'lucide-react'
import { api } from '../services/api'
import ItemCard, { ItemCardData } from '../components/ItemCard'
import Reveal from '../components/ui/Reveal'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import EmptyState from '../components/ui/EmptyState'
import FloatingObjects from '../components/FloatingObjects'

const CATEGORIES = [
  { name: 'Electronics', icon: Smartphone },
  { name: 'Documents', icon: FileText },
  { name: 'Accessories', icon: Glasses },
  { name: 'Clothing', icon: Shirt },
  { name: 'Bags', icon: Backpack },
  { name: 'Keys', icon: Key },
]

interface Stats {
  total: number
  lost: number
  found: number
  returned: number
}

const TESTIMONIALS = [
  {
    quote:
      'I lost my wallet with my entire semester inside. I posted it at lunch and had a match before dinner. Retrievr genuinely works.',
    name: 'Ananya R.',
    role: 'Student',
  },
  {
    quote:
      'Found an airpods case on the library steps. Two minutes to report, and the owner was notified automatically. Ridiculously easy.',
    name: 'Marcus L.',
    role: 'Student',
  },
  {
    quote:
      'As an admin I can actually see every claim in one place and verify ownership properly. It makes hand-offs safe and fair.',
    name: 'Priya S.',
    role: 'Campus Admin',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<ItemCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL')
  const [stats, setStats] = useState<Stats>({ total: 0, lost: 0, found: 0, returned: 0 })

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await api.get('/items', { params: { size: 200, sortBy: 'createdAt' } })
        if (!active) return
        const data: ItemCardData[] = res.data.content || res.data || []
        setRecent(data)
        setStats({
          total: data.length,
          lost: data.filter((i) => i.itemType === 'LOST').length,
          found: data.filter((i) => i.itemType === 'FOUND').length,
          returned: data.filter((i) => i.status === 'RETURNED').length,
        })
      } catch {
        /* backend offline — graceful empty state */
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (tab === 'ALL') return recent.slice(0, 6)
    return recent.filter((i) => i.itemType === tab).slice(0, 6)
  }, [recent, tab])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/search${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-ink-800 bg-ink-900 text-white">
        {/* Floating 3D Objects with independent physics, parallax and hover tilt */}
        <FloatingObjects />

        {/* Subtle grid and ambient backdrop */}
        <div
          className="pointer-events-none absolute inset-0 bg-grid-faint-light opacity-20"
          style={{
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 35%, #000 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 35%, #000 40%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="container-page pointer-events-none relative z-10 grid grid-cols-1 items-center gap-14 py-20 lg:grid-cols-12 lg:gap-10 lg:py-28">
          {/* Copy */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto lg:col-span-7"
          >
            <span className="eyebrow rounded-full border border-cyan-400/30 bg-cyan-950/60 text-cyan-300 px-3.5 py-1 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Campus Lost &amp; Found, reimagined
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl drop-shadow-sm">
              Every lost item deserves a{' '}
              <span className="relative whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-primary-400">
                second chance.
                <svg
                  className="absolute -bottom-1 left-0 h-3 w-full text-cyan-400/80 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  viewBox="0 0 300 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8.5C60 3 150 2.5 298 6"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Report what you&apos;ve lost, list what you&apos;ve found, and let smart matching
              reunite belongings with their owners — fast.
            </p>

            {/* Search */}
            <form onSubmit={submitSearch} className="mt-8 max-w-xl" role="search">
              <div className="flex items-stretch overflow-hidden rounded-xl border border-cyan-500/30 bg-ink-800/85 backdrop-blur-md p-1.5 shadow-[0_4px_25px_rgba(0,0,0,0.4),0_0_20px_rgba(6,182,212,0.15)] transition-all focus-within:border-cyan-400 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.35)]">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400/70" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by item, brand, or location…"
                    aria-label="Search lost or found items"
                    className="w-full bg-transparent py-3 pl-11 pr-3 text-base text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary btn-lg shadow-[0_0_20px_rgba(46,91,255,0.4)]">
                  Search
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-400">Popular:</span>
              {['Electronics', 'Keys', 'Bags', 'Documents'].map((c) => (
                <Link
                  key={c}
                  to={`/search?category=${encodeURIComponent(c)}`}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-300 backdrop-blur-sm transition-colors hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300"
                >
                  {c}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Admin-verified claims
              </span>
              <span className="inline-flex items-center gap-2">
                <Link2 className="h-4 w-4 text-cyan-400" /> Smart matching
              </span>
              <span className="inline-flex items-center gap-2">
                <Recycle className="h-4 w-4 text-accent-400" /> Free to use
              </span>
            </div>
          </motion.div>

          {/* Hero illustration */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative lg:col-span-5"
            aria-hidden="true"
          >
            <div className="relative mx-auto max-w-md">
              {/* Back card */}
              <div className="absolute -left-4 top-8 hidden w-56 rotate-[-6deg] rounded-2xl border border-white/10 bg-ink-800/90 backdrop-blur-md p-4 shadow-float sm:block">
                <div className="flex items-center justify-between">
                  <span className="badge badge-lost">
                    <span className="h-1.5 w-1.5 rounded-full bg-lost" /> LOST
                  </span>
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-3 line-clamp-1 text-sm font-semibold text-white">Keys with red tag</p>
                <p className="mt-1 text-xs text-slate-400">Library · 2h ago</p>
              </div>

              {/* Front card */}
              <div className="relative ml-auto w-full max-w-[19rem] rounded-3xl border border-white/15 bg-ink-800/95 backdrop-blur-md p-3 shadow-float">
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-ink-900 border border-white/10">
                  <div
                    className="absolute inset-0 bg-grid-faint-light opacity-30"
                    style={{ backgroundSize: '22px 22px' }}
                  />
                  <Backpack className="relative h-20 w-20 text-white/90" strokeWidth={1.5} />
                  <span className="badge badge-found absolute left-3 top-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-found" /> FOUND
                  </span>
                </div>
                <div className="px-2 pb-1 pt-3">
                  <p className="font-display text-base font-semibold text-white">Black backpack</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" /> Student Center · Today
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20 text-[11px] font-bold text-cyan-300 border border-primary-500/30">
                      J
                    </span>
                    <span className="text-xs text-slate-300">Reported by Jamie</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200">
                      View <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating match chip */}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-5 -left-2 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-ink-800/95 backdrop-blur-md px-4 py-3 shadow-float sm:-left-8"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">It&apos;s a match!</p>
                  <p className="text-xs text-emerald-300/80">Owner notified</p>
                </div>
              </motion.div>

              {/* Floating bell chip */}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -right-1 top-6 flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-ink-800/95 backdrop-blur-md px-3.5 py-2.5 shadow-float sm:-right-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                  <Bell className="h-4 w-4" />
                </span>
                <p className="text-xs font-medium text-slate-200">3 new matches</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats band ───────────────────────────────────────── */}
      <section className="border-b border-hairline bg-white">
        <div className="container-page -mt-px grid grid-cols-2 divide-hairline py-8 sm:grid-cols-4 sm:divide-x">
          {[
            { label: 'Items reported', value: stats.total, icon: Boxes },
            { label: 'Lost reports', value: stats.lost, icon: PackageSearch },
            { label: 'Found reports', value: stats.found, icon: Package },
            { label: 'Reunited', value: stats.returned, icon: Recycle },
          ].map(({ label, value, icon: Icon }, i) => (
            <Reveal
              key={label}
              delay={i * 0.06}
              className="flex items-center gap-4 px-2 py-4 sm:justify-center sm:px-6"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                  <AnimatedCounter value={value} />
                </p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="section bg-canvas">
        <div className="container-page">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">Browse</span>
              <h2 className="section-title mt-2">Browse by category</h2>
              <p className="section-subtitle">Jump straight to the kind of item you lost or found.</p>
            </div>
            <Link to="/search" className="btn-secondary shrink-0">
              View all items <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {CATEGORIES.map(({ name, icon: Icon }, i) => (
              <Reveal key={name} delay={i * 0.04}>
                <Link
                  to={`/search?category=${encodeURIComponent(name)}`}
                  className="card card-hover flex h-full flex-col items-center gap-3 p-5 text-center sm:p-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors duration-200 group-hover:bg-primary-100">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold text-ink-900">{name}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Report CTA ───────────────────────────────────────── */}
      <section className="bg-white pb-4 pt-2 sm:pb-6 sm:pt-4">
        <div className="container-page grid grid-cols-1 gap-5 md:grid-cols-2">
          <Reveal>
            <div className="card-hover flex h-full flex-col gap-4 border-l-4 border-l-lost p-6 sm:flex-row sm:items-center sm:p-8">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-lost">
                <PackageSearch className="h-7 w-7" />
              </span>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-ink-900">Report a lost item</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Can&apos;t find something? Tell the community and let matching do the work.
                </p>
              </div>
              <Link to="/report/lost" className="btn-primary shrink-0">
                Report lost
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="card-hover flex h-full flex-col gap-4 border-l-4 border-l-found p-6 sm:flex-row sm:items-center sm:p-8">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-found">
                <Package className="h-7 w-7" />
              </span>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-ink-900">Report a found item</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Found something? List it here and help reunite it with its owner.
                </p>
              </div>
              <Link to="/report/found" className="btn-accent shrink-0">
                Report found
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Recently reported ────────────────────────────────── */}
      <section className="section bg-canvas">
        <div className="container-page">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">Latest</span>
              <h2 className="section-title mt-2">Recently reported</h2>
              <p className="section-subtitle">The newest lost and found items across the community.</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                role="tablist"
                aria-label="Filter by type"
                className="inline-flex rounded-lg border border-hairline bg-white p-1"
              >
                {(['ALL', 'LOST', 'FOUND'] as const).map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      tab === t
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t === 'ALL' ? 'All' : t === 'LOST' ? 'Lost' : 'Found'}
                  </button>
                ))}
              </div>
              <Link to="/search" className="btn-secondary hidden shrink-0 sm:inline-flex">
                Browse all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="skeleton aspect-[4/3] rounded-none" />
                    <div className="space-y-3 p-5">
                      <div className="skeleton h-4 w-24" />
                      <div className="skeleton h-5 w-3/4" />
                      <div className="skeleton h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item, i) => (
                  <Reveal key={item.id} delay={Math.min(i * 0.05, 0.3)}>
                    <ItemCard item={item} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="card">
                <EmptyState
                  icon={PackageSearch}
                  title="No reports here yet"
                  description="When someone reports a lost or found item, it will appear here. Be the first to post."
                  action={
                    <>
                      <Link to="/report/lost" className="btn-primary">
                        Report lost
                      </Link>
                      <Link to="/report/found" className="btn-secondary">
                        Report found
                      </Link>
                    </>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">How it works</span>
            <h2 className="section-title mt-2">Three steps from lost to found</h2>
            <p className="section-subtitle mx-auto">
              No posters, no group chats. Just a clear path back to what&apos;s yours.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                n: '01',
                title: 'Report the item',
                body: 'Post a lost or found item with photos, category, location, and a description in under a minute.',
                icon: PackageSearch,
              },
              {
                n: '02',
                title: 'Smart matching',
                body: 'Our matching engine pairs lost and found reports so likely matches surface instantly.',
                icon: Link2,
              },
              {
                n: '03',
                title: 'Claim & reunite',
                body: 'Submit a claim, an admin verifies ownership, and the item is safely returned.',
                icon: ShieldCheck,
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="card card-hover relative h-full p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                      <s.icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-4xl font-extrabold text-primary-100">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="section bg-canvas">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Community</span>
            <h2 className="section-title mt-2">Reunions, in their words</h2>
            <p className="section-subtitle mx-auto">
              Students and admins on what it feels like to bring something back.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <figure className="card flex h-full flex-col p-6 sm:p-7">
                  <div className="flex gap-0.5 text-accent-400">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-gray-700">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-hairline pt-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────── */}
      <section className="bg-white pb-20 pt-4">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-4xl bg-ink-900 px-6 py-14 text-center sm:px-12 sm:py-16">
              <div
                className="pointer-events-none absolute inset-0 bg-grid-faint-light opacity-40"
                style={{ backgroundSize: '26px 26px' }}
                aria-hidden="true"
              />
              <div className="relative">
                <h2 className="font-display text-3xl font-bold text-white text-balance sm:text-4xl">
                  Ready to bring it back?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-white/70">
                  Join a community that turns lost belongings into happy reunions. It takes less
                  than a minute to post.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/register" className="btn-accent btn-lg">
                    Create free account
                  </Link>
                  <Link
                    to="/report/found"
                    className="btn btn-lg border border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    Report an item
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}