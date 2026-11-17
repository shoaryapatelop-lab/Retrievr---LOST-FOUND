import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight, Bell, Calendar, Check, CheckCheck, CheckCircle, ClipboardList,
  LayoutDashboard, MapPin, Package, PackageSearch, Plus, Sparkles,
  Zap, Inbox as InboxIcon,
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import DashboardShell, { DashNavItem } from '../components/DashboardShell'
import MetricCard from '../components/dashboard/MetricCard'
import ActivityFeed, { ActivityEntry, ActivityKind } from '../components/dashboard/ActivityFeed'
import QuickReport from '../components/dashboard/QuickReport'
import GlassPanel from '../components/dashboard/GlassPanel'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'

interface Item {
  id: number
  title: string
  description: string
  locationFound: string
  dateFound: string
  status: string
  itemType: string
  categoryName?: string
  imageUrls?: string[]
  createdAt: string
}

interface Claim {
  id: number
  itemId: number
  itemTitle: string
  status: string
  message?: string
  createdAt: string
}

interface Notification {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  relatedEntityType?: string
  relatedEntityId?: number
  createdAt: string
}

const claimClass: Record<string, string> = {
  PENDING: 'badge-available',
  APPROVED: 'badge-returned',
  REJECTED: 'badge-lost',
}

const claimLabel: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

const notifIcon: Record<string, typeof Bell> = {
  POTENTIAL_MATCH: Sparkles,
  CLAIM_UPDATE: ClipboardList,
  ITEM_UPDATE: Package,
  SYSTEM: Bell,
}

function notifKind(n: Notification): ActivityKind {
  if (n.type === 'POTENTIAL_MATCH') return 'match'
  if (n.type === 'ITEM_UPDATE') return 'report'
  if (n.type === 'CLAIM_UPDATE') {
    const title = n.title.toLowerCase()
    if (title.includes('approved')) return 'claim-approved'
    if (title.includes('rejected')) return 'claim-rejected'
    return 'claim'
  }
  return 'system'
}

const shortDate = (raw?: string) => {
  if (!raw) return ''
  const date = new Date(raw)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const TABS = ['overview', 'items', 'claims', 'matches', 'notifications'] as const
type Tab = (typeof TABS)[number]

interface AgentPrompt {
  id: string
  title: string
  description: string
  icon: typeof Zap
  to: string
  tone: 'primary' | 'lost' | 'found'
}

export default function MainDashboard() {
  const { user } = useAuth()
  const reduce = useReducedMotion()
  const [tab, setTab] = useState<Tab>('overview')
  const [items, setItems] = useState<Item[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [itemFilter, setItemFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setLoadError('')
      const results = await Promise.allSettled([
        api.get('/items/my'),
        api.get('/claims/my'),
        api.get('/notifications'),
      ])
      if (results[0].status === 'fulfilled') setItems(results[0].value.data || [])
      if (results[1].status === 'fulfilled') setClaims(results[1].value.data || [])
      if (results[2].status === 'fulfilled') setNotifications(results[2].value.data || [])
      if (results.every((result) => result.status === 'rejected')) {
        setLoadError('Could not load your dashboard. Please try again later.')
      }
      setLoading(false)
    }
    load()
  }, [])

  const lostCount = items.filter((item) => item.itemType === 'LOST').length
  const foundCount = items.filter((item) => item.itemType === 'FOUND').length
  const pendingClaims = claims.filter((claim) => claim.status === 'PENDING')
  const approvedClaims = claims.filter((claim) => claim.status === 'APPROVED').length
  const unread = notifications.filter((n) => !n.isRead).length
  const matches = useMemo(
    () => notifications.filter((n) => n.type === 'POTENTIAL_MATCH'),
    [notifications],
  )

  const markRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((current) =>
        current.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      )
    } catch {
      /* non-blocking */
    }
  }

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)
    await Promise.all(unreadIds.map((id) => api.put(`/notifications/${id}/read`).catch(() => null)))
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })))
  }

  const activity = useMemo<ActivityEntry[]>(() => {
    const entries: ActivityEntry[] = []
    notifications.forEach((n) => {
      entries.push({
        id: `n-${n.id}`,
        kind: notifKind(n),
        title: n.title,
        detail: n.message,
        at: n.createdAt,
        href: n.relatedEntityId ? `/item/${n.relatedEntityId}` : undefined,
        unread: !n.isRead,
      })
    })
    pendingClaims.forEach((claim) => {
      entries.push({
        id: `c-${claim.id}`,
        kind: 'claim',
        title: `Claim pending: ${claim.itemTitle}`,
        detail: claim.message,
        at: claim.createdAt,
        href: `/item/${claim.itemId}`,
      })
    })
    items.forEach((item) => {
      entries.push({
        id: `i-${item.id}`,
        kind: 'report',
        title: `${item.itemType === 'LOST' ? 'Lost' : 'Found'} report: ${item.title}`,
        detail: item.locationFound || undefined,
        at: item.createdAt,
        href: `/item/${item.id}`,
      })
    })
    return entries
  }, [notifications, pendingClaims, items])

  const nav: DashNavItem[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'items', label: 'My items', icon: Package, badge: items.length },
    { key: 'claims', label: 'My claims', icon: ClipboardList, badge: claims.length },
    { key: 'matches', label: 'Matches', icon: Sparkles, badge: matches.length },
    { key: 'notifications', label: 'Notifications', icon: Bell, badge: unread },
  ]

  const filteredItems =
    itemFilter === 'ALL' ? items : items.filter((item) => item.itemType === itemFilter)

  const agentPrompts: AgentPrompt[] = [
    {
      id: 'report-lost',
      title: 'Submit a new lost report',
      description: 'Log a missing item so the matching engine can find it.',
      icon: PackageSearch,
      to: '/report/lost',
      tone: 'lost',
    },
    {
      id: 'report-found',
      title: 'Report a found item',
      description: 'Help someone recover what they lost.',
      icon: Package,
      to: '/report/found',
      tone: 'found',
    },
    {
      id: 'review-claims',
      title: 'Review pending claims',
      description:
        pendingClaims.length > 0
          ? `${pendingClaims.length} claim${pendingClaims.length > 1 ? 's' : ''} awaiting your decision.`
          : 'No claims waiting right now.',
      icon: ClipboardList,
      to: '/dashboard',
      tone: 'primary',
    },
  ]

  return (
    <DashboardShell
      shellClassName="mesh-canvas"
      nav={nav}
      active={tab}
      onChange={(key) => setTab(key as Tab)}
      userName={user ? `${user.firstName} ${user.lastName}` : 'My account'}
      userRole={user?.role === 'ADMIN' ? 'Administrator' : 'Student'}
      title="Main Dashboard"
      subtitle={`Welcome back, ${user?.firstName || 'there'}. Your agent has prepared the next best actions.`}
      actions={
        <>
          <Link to="/report/lost" className="btn-secondary min-h-[44px]">
            <Plus className="h-4 w-4" aria-hidden="true" /> Report lost
          </Link>
          <Link to="/report/found" className="btn-primary min-h-[44px]">
            <Plus className="h-4 w-4" aria-hidden="true" /> Report found
          </Link>
        </>
      }
    >
      {/* ── Agent Command Panel (high priority, first thing seen) ─── */}
      <section aria-label="Agent command panel" className="mb-6">
        <GlassPanel tone="strong" as="div" className="overflow-hidden p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/branding/retrievr-logo.png"
              alt="Retrievr"
              className="h-8 w-auto"
            />
            <div>
              <p className="eyebrow">Agentic guidance</p>
              <h2 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">
                Your next best actions
              </h2>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agentPrompts.map((prompt, index) => {
              const toneChip =
                prompt.tone === 'lost'
                  ? 'bg-red-50 text-lost'
                  : prompt.tone === 'found'
                  ? 'bg-emerald-50 text-found'
                  : 'bg-primary-50 text-primary-700'
              return (
                <motion.div
                  key={prompt.id}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={prompt.to}
                    className="group flex h-full items-start gap-3 rounded-xl border border-hairline bg-white/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneChip}`}>
                      <prompt.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink-900 group-hover:text-primary-700">
                        {prompt.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-600">
                        {prompt.description}
                      </span>
                    </span>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 self-center text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600" aria-hidden="true" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </GlassPanel>
      </section>

      {/* ── Metrics ─────────────────────────────────────────────── */}
      <section aria-label="Your at a glance" className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <MetricCard
          icon={Package}
          label="My reports"
          value={items.length}
          tone="primary"
          hint={`${lostCount} lost · ${foundCount} found`}
        />
        <MetricCard
          icon={PackageSearch}
          label="Lost reports"
          value={lostCount}
          tone="lost"
          hint={lostCount === 0 ? 'Nothing reported lost' : 'Waiting to be matched'}
        />
        <MetricCard
          icon={CheckCircle}
          label="Found reports"
          value={foundCount}
          tone="found"
          hint={foundCount === 0 ? 'Nothing reported found' : 'Listed by you'}
        />
        <MetricCard
          icon={ClipboardList}
          label="Active claims"
          value={pendingClaims.length}
          tone="warning"
          hint={approvedClaims > 0 ? `${approvedClaims} approved overall` : 'No decisions yet'}
        />
      </section>

      {loadError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {loadError}
        </div>
      )}

      <div className="mt-2">
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="glass-panel p-5">
                  <div className="skeleton h-10 w-10 rounded-xl" />
                  <div className="skeleton mt-4 h-7 w-16" />
                  <div className="skeleton mt-2 h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'overview' && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
                <div className="lg:order-2 lg:col-span-5">
                  <QuickReport />
                </div>
                <GlassPanel as="section" className="lg:order-1 lg:col-span-7" id="recent-activity">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4">
                    <div>
                      <h2 className="font-display text-lg font-bold text-ink-900">Recent activity</h2>
                      <p className="mt-0.5 text-sm text-gray-600">
                        Reports, claims and matches across your account.
                      </p>
                    </div>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="btn-ghost btn-sm min-h-[44px]">
                        <CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark all read
                      </button>
                    )}
                  </div>
                  {activity.length === 0 ? (
                    <EmptyState
                      icon={InboxIcon}
                      title="Nothing here yet"
                      description="Your reports, claims and match alerts will appear here as they happen."
                      action={
                        <Link to="/search" className="btn-primary min-h-[44px]">
                          Browse items
                        </Link>
                      }
                    />
                  ) : (
                    <div className="p-2 sm:p-3">
                      <ActivityFeed entries={activity} limit={8} />
                    </div>
                  )}
                </GlassPanel>
              </div>
            )}

            {tab === 'items' && (
              <GlassPanel as="section">
                <div className="flex flex-col gap-3 border-b border-hairline p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink-900">My items</h2>
                    <p className="mt-0.5 text-sm text-gray-600">
                      Everything you have reported, newest first.
                    </p>
                  </div>
                  <div
                    className="inline-flex self-start rounded-lg border border-hairline bg-white/80 p-1"
                    role="group"
                    aria-label="Filter by report type"
                  >
                    {(['ALL', 'LOST', 'FOUND'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setItemFilter(filter)}
                        aria-pressed={itemFilter === filter}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                          itemFilter === filter
                            ? 'bg-primary-600 text-white'
                            : 'text-ink-700 hover:bg-gray-100'
                        }`}
                      >
                        {filter === 'ALL' ? 'All' : filter === 'LOST' ? 'Lost' : 'Found'}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredItems.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No items yet"
                    description="Report something you've lost or found and it will show up here."
                    action={
                      <>
                        <Link to="/report/lost" className="btn-primary min-h-[44px]">
                          Report lost
                        </Link>
                        <Link to="/report/found" className="btn-secondary min-h-[44px]">
                          Report found
                        </Link>
                      </>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-hairline">
                    {filteredItems.map((item) => (
                      <motion.li
                        key={item.id}
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-4 p-4 transition-colors duration-200 hover:bg-white/70 sm:p-5"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.imageUrls && item.imageUrls.length > 0 ? (
                            <img
                              src={item.imageUrls[0]}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <Package className="h-6 w-6" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <StatusBadge itemType={item.itemType} status={item.status} />
                          <p className="mt-1 truncate font-medium text-ink-900">{item.title}</p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-600">
                            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            {item.locationFound || '—'}
                            <span aria-hidden="true" className="mx-1">
                              ·
                            </span>
                            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                            {shortDate(item.dateFound) || shortDate(item.createdAt)}
                          </p>
                        </div>
                        <Link to={`/item/${item.id}`} className="btn-secondary btn-sm shrink-0">
                          View <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </GlassPanel>
            )}

            {tab === 'claims' && (
              <GlassPanel as="section">
                <div className="border-b border-hairline p-5">
                  <h2 className="font-display text-lg font-bold text-ink-900">My claims</h2>
                  <p className="mt-0.5 text-sm text-gray-600">
                    Track the review status of items you have claimed.
                  </p>
                </div>
                {claims.length === 0 ? (
                  <EmptyState
                    icon={ClipboardList}
                    title="No claims yet"
                    description="When you claim a found item, you can track its review status here."
                    action={
                      <Link to="/search" className="btn-primary min-h-[44px]">
                        Browse found items
                      </Link>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-hairline">
                    {claims.map((claim) => (
                      <li key={claim.id} className="p-4 transition-colors hover:bg-white/70 sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`badge ${claimClass[claim.status] || 'badge-neutral'}`}>
                                {claimLabel[claim.status] || claim.status}
                              </span>
                              <Link
                                to={`/item/${claim.itemId}`}
                                className="truncate font-medium text-ink-900 hover:text-primary-700"
                              >
                                {claim.itemTitle}
                              </Link>
                            </div>
                            {claim.message && (
                              <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                                {claim.message}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-gray-600">
                              Claimed {new Date(claim.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Link
                            to={`/item/${claim.itemId}`}
                            className="btn-secondary btn-sm shrink-0"
                          >
                            View item
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassPanel>
            )}

            {tab === 'matches' && (
              <GlassPanel as="section">
                <div className="border-b border-hairline p-5">
                  <h2 className="font-display text-lg font-bold text-ink-900">Potential matches</h2>
                  <p className="mt-0.5 text-sm text-gray-600">
                    Items our matching engine thinks belong to you.
                  </p>
                </div>
                {matches.length === 0 ? (
                  <EmptyState
                    icon={Sparkles}
                    title="No matches yet"
                    description="When a found item looks like something you've lost, it will appear here automatically."
                  />
                ) : (
                  <ul className="divide-y divide-hairline">
                    {matches.map((n) => (
                      <li
                        key={n.id}
                        className="flex items-start gap-3 p-4 transition-colors hover:bg-white/70 sm:p-5"
                      >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink-900">{n.title}</p>
                          <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                          {n.relatedEntityId && (
                            <Link
                              to={`/item/${n.relatedEntityId}`}
                              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
                            >
                              View item <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassPanel>
            )}

            {tab === 'notifications' && (
              <GlassPanel as="section">
                <div className="flex items-center justify-between border-b border-hairline p-5">
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink-900">Notifications</h2>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {unread === 0 ? 'You are all caught up.' : `${unread} unread`}
                    </p>
                  </div>
                  {unread > 0 && (
                    <button onClick={markAllRead} className="btn-ghost btn-sm min-h-[44px]">
                      <CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <EmptyState
                    icon={InboxIcon}
                    title="You're all caught up"
                    description="Match alerts, claim updates and platform news will appear here."
                  />
                ) : (
                  <ul className="divide-y divide-hairline">
                    {notifications.map((n) => {
                      const Icon = notifIcon[n.type] || Bell
                      return (
                        <li
                          key={n.id}
                          className={`flex items-start gap-3 p-4 transition-colors sm:p-5 ${
                            n.isRead ? 'hover:bg-white/70' : 'bg-primary-50/50'
                          }`}
                        >
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-ink-900">{n.title}</p>
                              {!n.isRead && (
                                <span className="shrink-0 rounded-full bg-primary-600 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                            <p className="mt-1 text-xs text-gray-600">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!n.isRead && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="shrink-0 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink-900"
                              aria-label={`Mark "${n.title}" as read`}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" aria-hidden="true" />
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </GlassPanel>
            )}
          </motion.div>
        )}
      </div>
    </DashboardShell>
  )
}
