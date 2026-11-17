import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin, Calendar, Tag, User, Clock, AlertCircle, ChevronRight, ChevronLeft,
  ImageOff, ShieldCheck, CheckCircle2, PackageSearch, ArrowLeft, Palette, Building2,
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'

interface Item {
  id: number
  title: string
  description: string
  locationFound: string
  dateFound: string
  status: string
  color: string
  brand: string
  contactInfo: string
  reporterId: number
  reporterName: string
  categoryName: string
  itemType: string
  lastSeenLocation?: string
  createdAt: string
  updatedAt: string
  imageUrls: string[]
}

const formatDate = (raw?: string) => {
  if (!raw) return '—'
  const d = new Date(raw)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImg, setActiveImg] = useState(0)

  const [claimOpen, setClaimOpen] = useState(false)
  const [claimMessage, setClaimMessage] = useState('')
  const [claimSubmitting, setClaimSubmitting] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [itemClaims, setItemClaims] = useState<any[]>([])

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get(`/items/${id}`)
        setItem(response.data)
        if (user && response.data.reporterId === user.id) {
          try {
            const cr = await api.get(`/claims/item/${id}`)
            setItemClaims(cr.data || [])
          } catch {
            setItemClaims([])
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load item')
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
    window.scrollTo({ top: 0 })
  }, [id])

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || !user) return
    setClaimSubmitting(true)
    setClaimError('')
    try {
      await api.post('/claims', { itemId: item.id, message: claimMessage })
      setClaimSuccess(true)
      setClaimOpen(false)
      setClaimMessage('')
    } catch (err: any) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim. Please try again.')
    } finally {
      setClaimSubmitting(false)
    }
  }

  const handleClaimDecision = async (claimId: number, action: 'accept' | 'decline') => {
    try {
      if (action === 'accept') await api.put(`/claims/${claimId}/accept`)
      else await api.put(`/claims/${claimId}/decline`)
      setItemClaims((cs) => cs.map((c) => (c.id === claimId ? { ...c, status: action === 'accept' ? 'ACCEPTED_BY_FINDER' : 'REJECTED_BY_FINDER' } : c)))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed')
    }
  }

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-6 w-24" />
            <div className="skeleton h-9 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-10">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-lost">
            <AlertCircle className="h-8 w-8" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-ink-900">Item not found</h2>
          <p className="mt-2 text-gray-600">{error || 'This item may have been removed.'}</p>
          <button onClick={() => navigate('/search')} className="btn-primary mt-6">
            Back to browse
          </button>
        </div>
      </div>
    )
  }

  const images = item.imageUrls || []
  const isLost = item.itemType === 'LOST'
  const isOwn = user && item.reporterId === user.id
  const canClaim = user && !isOwn && item.status === 'AVAILABLE'

  const details = [
    { icon: Tag, label: 'Category', value: item.categoryName || '—' },
    {
      icon: MapPin,
      label: isLost ? 'Last seen location' : 'Location found',
      value: item.locationFound || item.lastSeenLocation || '—',
    },
    { icon: Calendar, label: isLost ? 'Date lost' : 'Date found', value: formatDate(item.dateFound) },
    { icon: Palette, label: 'Colour', value: item.color || '—' },
    { icon: Building2, label: 'Brand', value: item.brand || '—' },
    { icon: Clock, label: 'Reported on', value: formatDate(item.createdAt) },
  ].filter((d) => d.value && d.value !== '—')

  return (
    <div className="bg-canvas">
      <div className="container-page py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink-900">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/search" className="hover:text-ink-900">
            Browse
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-ink-900">{item.title}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Media */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-hairline bg-gray-100">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={`${item.title} — photo ${activeImg + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
                  <ImageOff className="h-10 w-10" />
                  <span className="text-sm font-medium">No photo provided</span>
                </div>
              )}
              <StatusBadge itemType={item.itemType} className="absolute left-4 top-4" />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-card transition-colors hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-card transition-colors hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View photo ${i + 1}`}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      i === activeImg ? 'border-primary-500' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Reporter card */}
            <div className="card mt-4 flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 font-display text-lg font-bold text-primary-700">
                {item.reporterName?.charAt(0).toUpperCase() || '?'}
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-gray-400">Reported by</p>
                <p className="truncate font-display text-base font-semibold text-ink-900">
                  {item.reporterName || 'Community member'}
                </p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-found">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified member
              </span>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <StatusBadge status={item.status} className="mb-3" />
            <h1 className="font-display text-3xl font-bold leading-tight text-ink-900 sm:text-4xl">
              {item.title}
            </h1>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-gray-600">
              {item.description}
            </p>

            {/* Meta grid */}
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-hairline pt-6">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
                    <dd className="truncate text-sm font-medium text-ink-900">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              {canClaim && (
                <button onClick={() => setClaimOpen(true)} className="btn-primary btn-lg w-full">
                  Claim this item
                </button>
              )}

               {isOwn && itemClaims.length > 0 && (
                 <div className="rounded-xl border border-hairline bg-white p-4">
                   <h3 className="font-display text-base font-semibold text-ink-900 mb-3">Claim Requests ({itemClaims.filter(c => c.status === 'PENDING').length} pending)</h3>
                   <ul className="space-y-3">
                     {itemClaims.map((c) => (
                       <li key={c.id} className="rounded-lg border border-hairline p-3">
                         <p className="text-sm font-medium text-ink-900">{c.claimerName || 'Claimant'}</p>
                         <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                         {c.message && <p className="mt-2 text-sm text-gray-600">{c.message}</p>}
                         <p className="mt-2 text-xs font-semibold text-amber-700">{c.status}</p>
                         {c.status === 'PENDING' && (
                           <div className="mt-3 flex gap-2">
                             <button onClick={() => handleClaimDecision(c.id, 'decline')} className="btn-secondary btn-sm">Decline</button>
                             <button onClick={() => handleClaimDecision(c.id, 'accept')} className="btn-success btn-sm">Accept</button>
                           </div>
                         )}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}

               {isOwn && (
                 <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                   <User className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                   <p className="text-sm text-primary-800">
                     This is your reported item. Manage it from your{' '}
                     <Link to="/dashboard" className="font-semibold underline">
                       dashboard
                     </Link>
                     .
                   </p>
                 </div>
               )}

              {!user && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    Please sign in to claim this item.
                  </p>
                  <Link to="/login" className="btn-primary btn-sm mt-3">
                    Log in to claim
                  </Link>
                </div>
              )}

              {item.status === 'CLAIMED' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  This item has a claim under review.
                </div>
              )}
              {item.status === 'RETURNED' && (
                <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-returned">
                  <CheckCircle2 className="h-5 w-5" /> This item has been reunited with its owner.
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-white p-4 text-xs text-gray-500 ring-1 ring-hairline">
              <ShieldCheck className="h-4 w-4 shrink-0 text-found" />
              The finder reviews claim requests. Admins help resolve disputes.
            </div>
          </motion.div>
        </div>

        <div className="mt-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to results
          </button>
        </div>
      </div>

      {/* Claim modal */}
      <Modal open={claimOpen} onClose={() => setClaimOpen(false)} title="Claim this item">
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-canvas p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <PackageSearch className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{item.title}</p>
              <p className="text-xs text-gray-500">{item.categoryName}</p>
            </div>
          </div>
          <div>
            <label htmlFor="claimMessage" className="input-label">
              How do you know this is yours? <span className="text-lost">*</span>
            </label>
            <textarea
              id="claimMessage"
              rows={4}
              required
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              className="input-field"
              placeholder="Describe identifying details only the owner would know (serial number, contents, marks, where you lost it)…"
            />
            <p className="field-hint">
              Admins use these details to verify ownership before approving your claim.
            </p>
          </div>
          {claimError && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-lost">
              {claimError}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setClaimOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={claimSubmitting} className="btn-primary flex-1">
              {claimSubmitting ? 'Submitting…' : 'Submit claim'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Success modal */}
      <Modal open={claimSuccess} onClose={() => setClaimSuccess(false)} title="Claim submitted">
        <div className="flex flex-col items-center py-4 text-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-found"
          >
            <CheckCircle2 className="h-9 w-9" />
          </motion.span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink-900">Claim sent for review</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-600">
            An admin will review your claim and contact you about the next steps.
          </p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setClaimSuccess(false)} className="btn-secondary">
              Done
            </button>
            <Link to="/dashboard" className="btn-primary">
              View my claims
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  )
}
