import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package, Search, CheckCircle, Check, Bell, Plus, ClipboardList, Sparkles,
  MapPin, Calendar, ArrowRight, CheckCheck, Inbox,
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import DashboardShell, { DashNavItem } from '../components/DashboardShell'
import StatCard from '../components/ui/StatCard'
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
  claimerName?: string
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

const shortDate = (raw?: string) => {
  if (!raw) return ''
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('items')
  const [items, setItems] = useState<Item[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [receivedClaims, setReceivedClaims] = useState<Claim[]>([])
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
         api.get('/claims/received'),
         api.get('/notifications'),
       ])
       let failed = false
       results.forEach((r) => {
         if (r.status === 'rejected') failed = true
       })
       if (results[0].status === 'fulfilled') setItems(results[0].value.data || [])
       if (results[1].status === 'fulfilled') setClaims(results[1].value.data || [])
       if (results[2].status === 'fulfilled') setReceivedClaims(results[2].value.data || [])
       if (results[3].status === 'fulfilled') setNotifications(results[3].value.data || [])
      if (failed && results.every((r) => r.status === 'rejected')) {
        setLoadError('Could not load your dashboard. Please try again later.')
      }
      setLoading(false)
    }
    load()
  }, [])

  const lostCount = items.filter((i) => i.itemType === 'LOST').length
  const foundCount = items.filter((i) => i.itemType === 'FOUND').length
  const unread = notifications.filter((n) => !n.isRead).length
  const matches = useMemo(
    () => notifications.filter((n) => n.type === 'POTENTIAL_MATCH'),
    [notifications],
  )

  const markRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch {
      /* ignore */
    }
  }

  const handleClaimAction = async (id: number, action: 'accept' | 'decline') => {
    try {
      if (action === 'accept') await api.put(`/claims/${id}/accept`)
      else await api.put(`/claims/${id}/decline`)
      setReceivedClaims((rc) => rc.map((c) => (c.id === id ? { ...c, status: action === 'accept' ? 'ACCEPTED_BY_FINDER' : 'REJECTED_BY_FINDER' } : c)))
    } catch (e) {
      console.error('Claim action failed', e)
    }
  }

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)
    await Promise.all(unreadIds.map((id) => api.put(`/notifications/${id}/read`).catch(() => null)))
    setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })))
  }

  const nav: DashNavItem[] = [
    { key: 'items', label: 'My items', icon: Package, badge: items.length },
    { key: 'requests', label: 'Claim requests', icon: ClipboardList, badge: receivedClaims.filter(c => c.status === 'PENDING').length },
    { key: 'claims', label: 'My claims', icon: ClipboardList, badge: claims.length },
    { key: 'matches', label: 'Matches', icon: Sparkles, badge: matches.length },
    { key: 'notifications', label: 'Notifications', icon: Bell, badge: unread },
  ]

  const filteredItems = itemFilter === 'ALL' ? items : items.filter((i) => i.itemType === itemFilter)

  return (
    <DashboardShell
      nav={nav}
      active={tab}
      onChange={setTab}
      userName={user ? `${user.firstName} ${user.lastName}` : 'My account'}
      userRole={user?.role === 'ADMIN' ? 'Administrator' : 'Student'}
      title="Dashboard"
      subtitle={`Welcome back, ${user?.firstName || 'there'}. Here's what's happening with your reports.`}
      actions={
        <>
          <Link to="/report/lost" className="btn-secondary btn-sm">
            <Plus className="h-4 w-4" /> Report lost
          </Link>
          <Link to="/report/found" className="btn-primary btn-sm">
            <Plus className="h-4 w-4" /> Report found
          </Link>
        </>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Package} label="Lost items" value={lostCount} tone="lost" />
        <StatCard icon={Search} label="Found items" value={foundCount} tone="found" />
        <StatCard icon={CheckCircle} label="My claims" value={claims.length} tone="primary" />
        <StatCard icon={Bell} label="Unread" value={unread} tone="warning" />
      </div>

      {loadError && (
        <div role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <DashboardSkeleton />
        ) : tab === 'items' ? (
          <section className="card">
            <div className="flex flex-col gap-3 border-b border-hairline p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-bold text-ink-900">My items</h2>
              <div className="inline-flex rounded-lg border border-hairline bg-white p-1">
                {(['ALL', 'LOST', 'FOUND'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setItemFilter(f)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      itemFilter === f ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f === 'LOST' ? 'Lost' : 'Found'}
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
                    <Link to="/report/lost" className="btn-primary btn-sm">
                      Report lost
                    </Link>
                    <Link to="/report/found" className="btn-secondary btn-sm">
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 sm:p-5"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.imageUrls && item.imageUrls.length > 0 ? (
                        <img src={item.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge itemType={item.itemType} status={item.status} />
                      </div>
                      <p className="mt-1 truncate font-medium text-ink-900">{item.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5" /> {item.locationFound || '—'}
                        <span className="mx-1">·</span>
                        <Calendar className="h-3.5 w-3.5" /> {shortDate(item.dateFound) || shortDate(item.createdAt)}
                      </p>
                    </div>
                    <Link
                      to={`/item/${item.id}`}
                      className="btn-secondary btn-sm shrink-0"
                    >
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </section>
         ) : tab === 'requests' ? (
           <section className="card">
             <div className="border-b border-hairline p-5">
               <h2 className="font-display text-lg font-bold text-ink-900">Claim requests</h2>
               <p className="mt-0.5 text-sm text-gray-500">Claims on items you reported.</p>
             </div>
             {receivedClaims.length === 0 ? (
               <EmptyState icon={ClipboardList} title="No claim requests" description="When someone claims an item you reported, it will appear here." />
             ) : (
               <ul className="divide-y divide-hairline">
                 {receivedClaims.map((claim) => (
                   <li key={claim.id} className="p-4 sm:p-5">
                     <div className="flex flex-wrap items-start justify-between gap-3">
                       <div className="min-w-0">
                         <p className="font-medium text-ink-900">{claim.itemTitle}</p>
                         <p className="text-xs text-gray-500">Claimed by {claim.claimerName || 'a student'}</p>
                         {claim.message && <p className="mt-2 text-sm text-gray-600">{claim.message}</p>}
                         <p className="mt-2 text-xs text-gray-400">{new Date(claim.createdAt).toLocaleString()}</p>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => handleClaimAction(claim.id, 'decline')} className="btn-secondary btn-sm">Decline</button>
                         <button onClick={() => handleClaimAction(claim.id, 'accept')} className="btn-success btn-sm">Accept</button>
                       </div>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
           </section>
         ) : tab === 'claims' ? (
          <section className="card">
            <div className="border-b border-hairline p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">My claims</h2>
            </div>
            {claims.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No claims yet"
                description="When you claim a found item, you can track its review status here."
                action={
                  <Link to="/search" className="btn-primary btn-sm">
                    Browse found items
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-hairline">
                {claims.map((claim) => (
                  <li key={claim.id} className="p-4 transition-colors hover:bg-gray-50 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`badge ${claimClass[claim.status] || 'badge-neutral'}`}>
                            {claimLabel[claim.status] || claim.status}
                          </span>
                          <Link to={`/item/${claim.itemId}`} className="truncate font-medium text-ink-900 hover:text-primary-700">
                            {claim.itemTitle}
                          </Link>
                        </div>
                        {claim.message && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{claim.message}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                          Claimed {new Date(claim.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/item/${claim.itemId}`} className="btn-secondary btn-sm shrink-0">
                        View item
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : tab === 'matches' ? (
          <section className="card">
            <div className="border-b border-hairline p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">Potential matches</h2>
              <p className="mt-0.5 text-sm text-gray-500">
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
                  <li key={n.id} className="flex items-start gap-3 p-4 transition-colors hover:bg-gray-50 sm:p-5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink-900">{n.title}</p>
                      <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                      {n.relatedEntityId && (
                        <Link
                          to={`/item/${n.relatedEntityId}`}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
                        >
                          View item <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section className="card">
            <div className="flex items-center justify-between border-b border-hairline p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">Notifications</h2>
              {unread > 0 && (
                <button onClick={markAllRead} className="btn-ghost btn-sm">
                  <CheckCheck className="h-4 w-4" /> Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <EmptyState
                icon={Inbox}
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
                        n.isRead ? '' : 'bg-primary-50/40'
                      }`}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-ink-900">{n.title}</p>
                          {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-ink-900"
                          aria-label="Mark as read"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}
      </div>
    </DashboardShell>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-11 w-11 rounded-xl" />
            <div className="skeleton mt-4 h-7 w-16" />
            <div className="skeleton mt-2 h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="card p-5">
        <div className="skeleton h-5 w-32" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}