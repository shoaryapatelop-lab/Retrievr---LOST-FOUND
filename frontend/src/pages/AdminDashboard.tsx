import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Package, AlertCircle, Check, X, LayoutDashboard, ClipboardList,
  PackageSearch, Recycle, ShieldCheck, CheckCircle2, XCircle,
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import DashboardShell, { DashNavItem } from '../components/DashboardShell'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'

interface DashboardStats {
  totalUsers: number
  totalLostItems: number
  totalFoundItems: number
  totalClaims: number
  pendingClaims: number
  resolvedCases: number
  returnedItems: number
  availableItems: number
}

interface UserRow {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  department?: string
}

interface ItemRow {
  id: number
  title: string
  status: string
  itemType: string
  createdAt: string
}

interface ClaimRow {
  id: number
  itemId: number
  itemTitle: string
  claimerName: string
  message?: string
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [items, setItems] = useState<ItemRow[]>([])
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [pendingAction, setPendingAction] = useState<{ claim: ClaimRow; action: 'approve' | 'reject' } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadClaims = async () => {
    const res = await api.get('/claims/pending')
    setClaims(res.data || [])
  }

  const loadStats = async () => {
    const res = await api.get('/admin/stats')
    setStats(res.data)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setLoadError('')
      const results = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/items'),
        api.get('/claims/pending'),
      ])
      if (results[0].status === 'fulfilled') setStats(results[0].value.data)
      if (results[1].status === 'fulfilled') setUsers(results[1].value.data || [])
      if (results[2].status === 'fulfilled') setItems(results[2].value.data || [])
      if (results[3].status === 'fulfilled') setClaims(results[3].value.data || [])
      if (results.every((r) => r.status === 'rejected')) {
        setLoadError('Could not load admin data. Make sure you are signed in as an admin.')
      }
      setLoading(false)
    }
    load()
  }, [])

  const runAction = async () => {
    if (!pendingAction) return
    setActionLoading(true)
    try {
      if (pendingAction.action === 'approve') {
        await api.put(`/claims/${pendingAction.claim.id}/approve`)
      } else {
        await api.put(`/claims/${pendingAction.claim.id}/reject`)
      }
      await loadClaims()
      await loadStats()
      setPendingAction(null)
    } catch (err) {
      console.error('Claim action failed', err)
    } finally {
      setActionLoading(false)
    }
  }

  const nav: DashNavItem[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: Users, badge: stats?.totalUsers },
    { key: 'items', label: 'Items', icon: Package, badge: items.length },
    { key: 'claims', label: 'Claims', icon: ClipboardList, badge: stats?.pendingClaims },
  ]

  const lost = stats?.totalLostItems || 0
  const found = stats?.totalFoundItems || 0
  const totalItems = lost + found || 1
  const lostPct = Math.round((lost / totalItems) * 100)

  return (
    <DashboardShell
      nav={nav}
      active={tab}
      onChange={setTab}
      userName={user ? `${user.firstName} ${user.lastName}` : 'Administrator'}
      userRole="Administrator"
      title="Admin dashboard"
      subtitle="Monitor activity, moderate reports and approve claims across Retrievr."
      actions={
        <Link to="/" className="btn-secondary btn-sm">
          View site
        </Link>
      }
    >
      {loadError && (
        <div role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      {/* Top stat row (always visible) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={stats?.totalUsers || 0} tone="primary" />
        <StatCard icon={PackageSearch} label="Lost items" value={lost} tone="lost" />
        <StatCard icon={Package} label="Found items" value={found} tone="found" />
        <StatCard icon={AlertCircle} label="Pending claims" value={stats?.pendingClaims || 0} tone="warning" />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="card p-6">
            <div className="skeleton h-5 w-40" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="skeleton h-40 w-full" />
              <div className="skeleton h-40 w-full" />
            </div>
          </div>
        ) : tab === 'overview' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Item distribution */}
              <div className="card p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold text-ink-900">Item distribution</h2>
                <p className="mt-0.5 text-sm text-gray-500">Lost vs found reports across the platform.</p>
                <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-gray-100">
                  <div className="bg-lost transition-all duration-500" style={{ width: `${lostPct}%` }} />
                  <div className="bg-found transition-all duration-500" style={{ width: `${100 - lostPct}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-lost" /> Lost
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-ink-900">{lost}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-found" /> Found
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-ink-900">{found}</p>
                  </div>
                </div>
              </div>

              {/* Claims overview */}
              <div className="card p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold text-ink-900">Claims overview</h2>
                <p className="mt-0.5 text-sm text-gray-500">Resolution status across all claims.</p>
                <ul className="mt-5 space-y-3">
                  {[
                    { label: 'Total claims', value: stats?.totalClaims || 0, icon: ClipboardList, color: 'text-primary-600' },
                    { label: 'Resolved', value: stats?.resolvedCases || 0, icon: CheckCircle2, color: 'text-found' },
                    { label: 'Returned items', value: stats?.returnedItems || 0, icon: Recycle, color: 'text-returned' },
                    { label: 'Available items', value: stats?.availableItems || 0, icon: Package, color: 'text-gray-500' },
                  ].map((row) => (
                    <li key={row.label} className="flex items-center justify-between border-b border-hairline pb-3 last:border-0 last:pb-0">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <row.icon className={`h-4 w-4 ${row.color}`} /> {row.label}
                      </span>
                      <span className="font-display text-lg font-bold text-ink-900">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pending claims preview */}
            <div className="card">
              <div className="flex items-center justify-between border-b border-hairline p-5">
                <h2 className="font-display text-lg font-bold text-ink-900">Awaiting review</h2>
                <button onClick={() => setTab('claims')} className="btn-ghost btn-sm">
                  View all
                </button>
              </div>
              {claims.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="No pending claims"
                  description="New claims will appear here for review."
                />
              ) : (
                <ul className="divide-y divide-hairline">
                  {claims.slice(0, 3).map((c) => (
                    <li key={c.id} className="flex items-center gap-3 p-4 sm:px-5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <ClipboardList className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink-900">{c.itemTitle}</p>
                        <p className="text-xs text-gray-500">Claimed by {c.claimerName}</p>
                      </div>
                      <span className="badge badge-available">Pending</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : tab === 'users' ? (
          <div className="card">
            <div className="border-b border-hairline p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">All users</h2>
              <p className="mt-0.5 text-sm text-gray-500">{users.length} registered accounts</p>
            </div>
            {users.length === 0 ? (
              <EmptyState icon={Users} title="No users" description="Registered users will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Email</th>
                      <th className="px-5 py-3 font-semibold">Role</th>
                      <th className="hidden px-5 py-3 font-semibold sm:table-cell">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {users.map((u) => (
                      <tr key={u.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-ink-900">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="px-5 py-3 text-gray-600">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-returned' : 'badge-available'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="hidden px-5 py-3 text-gray-600 sm:table-cell">{u.department || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : tab === 'items' ? (
          <div className="card">
            <div className="border-b border-hairline p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">All items</h2>
              <p className="mt-0.5 text-sm text-gray-500">{items.length} reports on the platform</p>
            </div>
            {items.length === 0 ? (
              <EmptyState icon={Package} title="No items" description="Reported items will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Title</th>
                      <th className="px-5 py-3 font-semibold">Type</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="hidden px-5 py-3 font-semibold sm:table-cell">Date</th>
                      <th className="px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {items.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-ink-900">{item.title}</td>
                        <td className="px-5 py-3">
                          <StatusBadge itemType={item.itemType} />
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="hidden px-5 py-3 text-gray-600 sm:table-cell">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <Link to={`/item/${item.id}`} className="font-medium text-primary-700 hover:text-primary-800">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="border-b border-hairline p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">Pending claims</h2>
              <p className="mt-0.5 text-sm text-gray-500">Review and approve or reject ownership claims.</p>
            </div>
            {claims.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="No pending claims"
                description="You're all caught up — new claims will appear here."
              />
            ) : (
              <ul className="divide-y divide-hairline">
                {claims.map((claim) => (
                  <li key={claim.id} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link to={`/item/${claim.itemId}`} className="font-medium text-ink-900 hover:text-primary-700">
                            {claim.itemTitle}
                          </Link>
                          <span className="badge badge-available">Pending</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Claimed by <span className="font-medium text-ink-800">{claim.claimerName}</span>
                        </p>
                        {claim.message && (
                          <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{claim.message}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                          {new Date(claim.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => setPendingAction({ claim, action: 'reject' })}
                          className="btn-secondary btn-sm"
                        >
                          <X className="h-4 w-4" /> Reject
                        </button>
                        <button
                          onClick={() => setPendingAction({ claim, action: 'approve' })}
                          className="btn-success btn-sm"
                        >
                          <Check className="h-4 w-4" /> Approve
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Confirm action modal */}
      <Modal
        open={!!pendingAction}
        onClose={() => !actionLoading && setPendingAction(null)}
        title={pendingAction?.action === 'approve' ? 'Approve this claim?' : 'Reject this claim?'}
        maxWidth="max-w-md"
      >
        {pendingAction && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-canvas p-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  pendingAction.action === 'approve'
                    ? 'bg-emerald-50 text-found'
                    : 'bg-red-50 text-lost'
                }`}
              >
                {pendingAction.action === 'approve' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">{pendingAction.claim.itemTitle}</p>
                <p className="text-sm text-gray-500">Claimed by {pendingAction.claim.claimerName}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {pendingAction.action === 'approve'
                ? 'Approving marks this item as returned to the claimant and closes the case. This cannot be undone.'
                : 'Rejecting closes this claim without returning the item. The claimant will be notified.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingAction(null)}
                disabled={actionLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={runAction}
                disabled={actionLoading}
                className={pendingAction.action === 'approve' ? 'btn-success flex-1' : 'btn-danger flex-1'}
              >
                {actionLoading
                  ? 'Working…'
                  : pendingAction.action === 'approve'
                  ? 'Approve claim'
                  : 'Reject claim'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  )
}