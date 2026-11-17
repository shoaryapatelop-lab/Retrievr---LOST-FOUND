import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Package, AlertCircle, Check, X, LayoutDashboard, ClipboardList,
  PackageSearch, Recycle, ShieldCheck, CheckCircle2, XCircle,
  Upload, Image, CheckCheck, Loader2, AlertTriangle, Hash, MapPin,
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

interface ImportDiscoveredItem {
  originalFilename: string
  filePath: string
  fileSize: number
  contentType: string
  suggestedLocation: string | null
  locationConfidence: string
  locationReason: string
  alreadyImported: boolean
  existingFileHash: string | null
}

interface ImportItemResponse {
  id: number
  importJobId: number
  originalFilename: string
  storedFilename: string | null
  filePath: string
  fileHash: string
  fileSize: number | null
  contentType: string | null
  suggestedLocation: string | null
  locationConfidence: string
  aiTitle: string | null
  aiDescription: string | null
  aiCategoryId: number | null
  aiCategoryName: string | null
  aiKeywords: string | null
  aiConfidence: string | null
  status: string
  reviewedBy: number | null
  reviewerName: string | null
  reviewedAt: string | null
  reviewNotes: string | null
  createdItemId: number | null
  createdAt: string
  updatedAt: string
}

interface ImportStatsResponse {
  totalDiscovered: number
  pendingReview: number
  approved: number
  rejected: number
  imported: number
  duplicates: number
  byLocation: Record<string, number>
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

  // Import state
  const [importTab, setImportTab] = useState<'discover' | 'review' | 'stats'>('discover')
  const [discoveredItems, setDiscoveredItems] = useState<ImportDiscoveredItem[]>([])
  const [reviewItems, setReviewItems] = useState<ImportItemResponse[]>([])
  const [importStats, setImportStats] = useState<ImportStatsResponse | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState('')
  const [pendingImportAction, setPendingImportAction] = useState<{ item: ImportItemResponse; action: 'approve' | 'reject' } | null>(null)
  const [importActionLoading, setImportActionLoading] = useState(false)
  const [approveForm, setApproveForm] = useState<{
    title: string
    description: string
    locationFound: string
    dateFound: string
    color: string
    brand: string
    contactInfo: string
    categoryId: number | null
    reviewNotes: string
  }>({
    title: '',
    description: '',
    locationFound: '',
    dateFound: new Date().toISOString().slice(0, 16),
    color: '',
    brand: '',
    contactInfo: '',
    categoryId: null,
    reviewNotes: ''
  })

  const loadClaims = async () => {
    const res = await api.get('/claims/pending')
    setClaims(res.data || [])
  }

  const loadStats = async () => {
    const res = await api.get('/admin/stats')
    setStats(res.data)
  }

  const loadDiscovered = async () => {
    setImportLoading(true)
    setImportError('')
    try {
      const res = await api.get('/admin/import/discover')
      setDiscoveredItems(res.data || [])
    } catch (err) {
      setImportError('Failed to discover images')
      console.error(err)
    } finally {
      setImportLoading(false)
    }
  }

  const loadReviewItems = async () => {
    setImportLoading(true)
    setImportError('')
    try {
      const res = await api.get('/admin/import/pending')
      setReviewItems(res.data || [])
    } catch (err) {
      setImportError('Failed to load review queue')
      console.error(err)
    } finally {
      setImportLoading(false)
    }
  }

  const loadImportStats = async () => {
    try {
      const res = await api.get('/admin/import/stats')
      setImportStats(res.data)
    } catch (err) {
      console.error(err)
    }
  }

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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setLoadError('')
      const results = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/items'),
        api.get('/claims/pending'),
        api.get('/admin/import/stats'),
      ])
      if (results[0].status === 'fulfilled') setStats(results[0].value.data)
      if (results[1].status === 'fulfilled') setUsers(results[1].value.data || [])
      if (results[2].status === 'fulfilled') setItems(results[2].value.data || [])
      if (results[3].status === 'fulfilled') setClaims(results[3].value.data || [])
      if (results[4].status === 'fulfilled') setImportStats(results[4].value.data)
      if (results.every((r) => r.status === 'rejected')) {
        setLoadError('Could not load admin data. Make sure you are signed in as an admin.')
      }
      setLoading(false)
    }
    load()
  }, [])

  const nav: DashNavItem[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: Users, badge: stats?.totalUsers },
    { key: 'items', label: 'Items', icon: Package, badge: items.length },
    { key: 'claims', label: 'Claims', icon: ClipboardList, badge: stats?.pendingClaims },
    { key: 'import', label: 'Import', icon: Upload, badge: importStats?.pendingReview },
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
        ) : tab === 'import' ? (
          <div className="space-y-6">
            {/* Import sub-tabs */}
            <div className="flex gap-2 border-b border-hairline">
              {(['discover', 'review', 'stats'] as const).map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => setImportTab(subTab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    importTab === subTab
                      ? 'bg-white text-ink-900 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {subTab === 'discover' && <span className="flex items-center gap-2"><Image className="h-4 w-4" /> Discover</span>}
                  {subTab === 'review' && <span className="flex items-center gap-2"><CheckCheck className="h-4 w-4" /> Review Queue</span>}
                  {subTab === 'stats' && <span className="flex items-center gap-2"><Hash className="h-4 w-4" /> Statistics</span>}
                </button>
              ))}
            </div>

            {importError && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {importError}
              </div>
            )}

            {importTab === 'discover' && (
              <div className="card">
                <div className="border-b border-hairline p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink-900">Discover Images</h2>
                    <p className="mt-0.5 text-sm text-gray-500">Scan uploads/ for new found-item photographs.</p>
                  </div>
                  <button
                    onClick={loadDiscovered}
                    disabled={importLoading}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {importLoading ? 'Scanning…' : 'Scan uploads/'}
                  </button>
                </div>
                {discoveredItems.length === 0 && !importLoading ? (
                  <EmptyState icon={Image} title="No images found" description="Run a scan to discover images in the uploads directory." />
                ) : (
                  <div className="divide-y divide-hairline">
                    {discoveredItems.map((item) => (
                      <div key={item.originalFilename} className="flex flex-wrap items-center gap-4 p-4 sm:px-5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-ink-900">{item.originalFilename}</p>
                          <p className="text-xs text-gray-500">
                            {item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                            {item.suggestedLocation && ` • Location: ${item.suggestedLocation}`}
                          </p>
                          {item.alreadyImported && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                              <AlertTriangle className="h-3 w-3" /> Already imported (duplicate)
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <span className={`badge ${
                            item.locationConfidence === 'HIGH' ? 'badge-found' :
                            item.locationConfidence === 'MEDIUM' ? 'badge-available' : 'badge-lost'
                          }`}>
                            {item.locationConfidence}
                          </span>
                          {!item.alreadyImported && item.suggestedLocation && (
                            <button
                              onClick={() => {
                                setImportTab('review')
                                loadReviewItems()
                              }}
                              className="btn-primary btn-sm"
                            >
                              Stage for Review
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {importTab === 'review' && (
              <div className="card">
                <div className="border-b border-hairline p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink-900">Review Queue</h2>
                    <p className="mt-0.5 text-sm text-gray-500">{reviewItems.length} items awaiting approval</p>
                  </div>
                  <button
                    onClick={loadReviewItems}
                    disabled={importLoading}
                    className="btn-ghost btn-sm"
                  >
                    {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                  </button>
                </div>
                {reviewItems.length === 0 && !importLoading ? (
                  <EmptyState icon={CheckCheck} title="Review queue empty" description="All caught up! Discover new images to add to the queue." />
                ) : (
                  <ul className="divide-y divide-hairline">
                    {reviewItems.map((item) => (
                      <li key={item.id} className="p-4 sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-ink-900 truncate">{item.originalFilename}</p>
                              <span className={`badge ${
                                item.status === 'PENDING_REVIEW' ? 'badge-available' :
                                item.status === 'IMPORTED' ? 'badge-found' :
                                item.status === 'REJECTED' ? 'badge-lost' :
                                item.status === 'DUPLICATE' ? 'badge-returned' : 'badge-available'
                              }`}>
                                {item.status}
                              </span>
                              {item.locationConfidence && (
                                <span className={`badge ${
                                  item.locationConfidence === 'HIGH' ? 'badge-found' :
                                  item.locationConfidence === 'MEDIUM' ? 'badge-available' : 'badge-lost'
                                }`}>
                                  {item.locationConfidence} confidence
                                </span>
                              )}
                            </div>
                            {item.suggestedLocation && (
                              <p className="mt-1 text-sm text-gray-500">Location: {item.suggestedLocation}</p>
                            )}
                            {item.aiTitle && (
                              <p className="mt-1 text-sm text-gray-600"><strong>AI Title:</strong> {item.aiTitle}</p>
                            )}
                            {item.aiDescription && (
                              <p className="mt-1 text-sm text-gray-600"><strong>AI Description:</strong> {item.aiDescription}</p>
                            )}
                            {item.aiCategoryName && (
                              <p className="mt-1 text-sm text-gray-600"><strong>AI Category:</strong> {item.aiCategoryName}</p>
                            )}
                            {item.aiConfidence && (
                              <p className="mt-1 text-xs text-gray-500">AI Confidence: {(parseFloat(item.aiConfidence) * 100).toFixed(0)}%</p>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() => {
                                setApproveForm({
                                  title: item.aiTitle || item.originalFilename,
                                  description: item.aiDescription || '',
                                  locationFound: item.suggestedLocation || '',
                                  dateFound: new Date().toISOString().slice(0, 16),
                                  color: '',
                                  brand: '',
                                  contactInfo: '',
                                  categoryId: item.aiCategoryId,
                                  reviewNotes: ''
                                })
                                setPendingImportAction({ item, action: 'approve' })
                              }}
                              disabled={item.status !== 'PENDING_REVIEW' || importActionLoading}
                              className="btn-success btn-sm"
                            >
                              <Check className="h-4 w-4" /> Approve
                            </button>
                            <button
                              onClick={() => setPendingImportAction({ item, action: 'reject' })}
                              disabled={item.status !== 'PENDING_REVIEW' || importActionLoading}
                              className="btn-secondary btn-sm"
                            >
                              <X className="h-4 w-4" /> Reject
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {importTab === 'stats' && importStats && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="card p-5 sm:p-6">
                  <h2 className="font-display text-lg font-bold text-ink-900">Import Statistics</h2>
                  <p className="mt-0.5 text-sm text-gray-500">Overview of college collection import pipeline.</p>
                  <ul className="mt-5 space-y-3">
                    {[
                      { label: 'Total Discovered', value: importStats.totalDiscovered, icon: Image, color: 'text-primary-600' },
                      { label: 'Pending Review', value: importStats.pendingReview, icon: AlertTriangle, color: 'text-warning' },
                      { label: 'Approved', value: importStats.approved, icon: CheckCircle2, color: 'text-found' },
                      { label: 'Rejected', value: importStats.rejected, icon: XCircle, color: 'text-lost' },
                      { label: 'Imported', value: importStats.imported, icon: Package, color: 'text-returned' },
                      { label: 'Duplicates Skipped', value: importStats.duplicates, icon: Hash, color: 'text-gray-500' },
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

                <div className="card p-5 sm:p-6">
                  <h2 className="font-display text-lg font-bold text-ink-900">By Location</h2>
                  <p className="mt-0.5 text-sm text-gray-500">Distribution of discovered items across college locations.</p>
                  {Object.keys(importStats.byLocation).length === 0 ? (
                    <EmptyState icon={Image} title="No location data" description="Discover images to see location distribution." />
                  ) : (
                    <ul className="mt-5 space-y-3">
                      {Object.entries(importStats.byLocation).map(([location, count]) => (
                        <li key={location} className="flex items-center justify-between border-b border-hairline pb-3 last:border-0 last:pb-0">
                          <span className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400" /> {location}
                          </span>
                          <span className="font-display text-lg font-bold text-ink-900">{count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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

      {/* Import action modal */}
      <Modal
        open={!!pendingImportAction}
        onClose={() => !importActionLoading && setPendingImportAction(null)}
        title={pendingImportAction?.action === 'approve' ? 'Approve this import?' : 'Reject this import?'}
        maxWidth="max-w-2xl"
      >
        {pendingImportAction && (
          <div className="space-y-4">
            {pendingImportAction.action === 'approve' && (
              <>
                <div className="flex items-start gap-3 rounded-xl bg-canvas p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-found">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900">{pendingImportAction.item.originalFilename}</p>
                    <p className="text-sm text-gray-500">Location: {pendingImportAction.item.suggestedLocation || 'Unknown'}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Fill in the details to publish this as a found item. AI-suggested values are pre-filled but can be edited.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={approveForm.title}
                      onChange={(e) => setApproveForm({...approveForm, title: e.target.value})}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={approveForm.description}
                      onChange={(e) => setApproveForm({...approveForm, description: e.target.value})}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location Found</label>
                    <input
                      type="text"
                      value={approveForm.locationFound}
                      onChange={(e) => setApproveForm({...approveForm, locationFound: e.target.value})}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date Found</label>
                      <input
                        type="datetime-local"
                        value={approveForm.dateFound}
                        onChange={(e) => setApproveForm({...approveForm, dateFound: e.target.value})}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={approveForm.categoryId || ''}
                        onChange={(e) => setApproveForm({...approveForm, categoryId: e.target.value ? Number(e.target.value) : null})}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">Select category</option>
                        <option value={1}>Electronics</option>
                        <option value={2}>Documents</option>
                        <option value={3}>Accessories</option>
                        <option value={4}>Clothing</option>
                        <option value={5}>Bags</option>
                        <option value={6}>Keys</option>
                        <option value={7}>Other Items</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Color</label>
                      <input
                        type="text"
                        value={approveForm.color}
                        onChange={(e) => setApproveForm({...approveForm, color: e.target.value})}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <input
                        type="text"
                        value={approveForm.brand}
                        onChange={(e) => setApproveForm({...approveForm, brand: e.target.value})}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Info</label>
                      <input
                        type="text"
                        value={approveForm.contactInfo}
                        onChange={(e) => setApproveForm({...approveForm, contactInfo: e.target.value})}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Review Notes (optional)</label>
                    <textarea
                      value={approveForm.reviewNotes}
                      onChange={(e) => setApproveForm({...approveForm, reviewNotes: e.target.value})}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </>
            )}
            {pendingImportAction.action === 'reject' && (
              <>
                <div className="flex items-start gap-3 rounded-xl bg-canvas p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-lost">
                    <XCircle className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900">{pendingImportAction.item.originalFilename}</p>
                    <p className="text-sm text-gray-500">This item will be marked as rejected and removed from the review queue.</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Rejecting removes this item from the review queue. It will not be published as a found item.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason (optional)</label>
                  <textarea
                    value={approveForm.reviewNotes}
                    onChange={(e) => setApproveForm({...approveForm, reviewNotes: e.target.value})}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              </>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setPendingImportAction(null)}
                disabled={importActionLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setImportActionLoading(true)
                  try {
                    if (pendingImportAction.action === 'approve') {
                      await api.post(`/admin/import/items/${pendingImportAction.item.id}/approve`, approveForm)
                    } else {
                      await api.post(`/admin/import/items/${pendingImportAction.item.id}/reject`, { reviewNotes: approveForm.reviewNotes })
                    }
                    await loadReviewItems()
                    await loadImportStats()
                    setPendingImportAction(null)
                  } catch (err) {
                    console.error('Import action failed', err)
                  } finally {
                    setImportActionLoading(false)
                  }
                }}
                disabled={importActionLoading}
                className={pendingImportAction.action === 'approve' ? 'btn-success flex-1' : 'btn-danger flex-1'}
              >
                {importActionLoading
                  ? 'Working…'
                  : pendingImportAction.action === 'approve'
                  ? 'Approve & Publish'
                  : 'Reject'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  )
}