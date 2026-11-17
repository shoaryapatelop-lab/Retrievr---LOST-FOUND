import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react'
import { api } from '../services/api'
import ItemCard, { ItemCardData } from '../components/ItemCard'
import EmptyState from '../components/ui/EmptyState'

const CATEGORIES = ['Electronics', 'Documents', 'Accessories', 'Clothing', 'Bags', 'Keys', 'Other Items']

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest first' },
  { value: 'createdAt,asc', label: 'Oldest first' },
  { value: 'title,asc', label: 'Title A–Z' },
  { value: 'dateFound,desc', label: 'Date found' },
]

interface Filters {
  keyword: string
  category: string
  location: string
  color: string
  brand: string
  status: string
  sort: string
}

interface PageResponse {
  content: ItemCardData[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const emptyFilters: Filters = {
  keyword: '',
  category: '',
  location: '',
  color: '',
  brand: '',
  status: '',
  sort: 'createdAt,desc',
}

const PAGE_SIZE = 9

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const initial = useMemo<Filters>(
    () => ({
      keyword: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      location: searchParams.get('location') || '',
      color: searchParams.get('color') || '',
      brand: searchParams.get('brand') || '',
      status: searchParams.get('status') || '',
      sort: 'createdAt,desc',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [draft, setDraft] = useState<Filters>(initial)
  const [applied, setApplied] = useState<Filters>(initial)
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    let active = true
    const fetchItems = async () => {
      setLoading(true)
      setError('')
      try {
        const params: Record<string, string | number> = {
          page,
          size: PAGE_SIZE,
          sort: applied.sort,
          sortBy: applied.sort.split(',')[0],
        }
        if (applied.keyword.trim()) params.keyword = applied.keyword.trim()
        if (applied.category) params.category = applied.category
        if (applied.location.trim()) params.location = applied.location.trim()
        if (applied.color.trim()) params.color = applied.color.trim()
        if (applied.brand.trim()) params.brand = applied.brand.trim()
        if (applied.status) params.status = applied.status
        const response = await api.get('/items', { params })
        if (!active) return
        const payload = response.data
        if (Array.isArray(payload)) {
          setData({ content: payload, totalElements: payload.length, totalPages: 1, number: 0, size: payload.length })
        } else {
          setData(payload)
        }
      } catch (err: any) {
        if (!active) return
        setError(err.response?.data?.message || 'Failed to load items. Please try again.')
        setData(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchItems()
    return () => {
      active = false
    }
  }, [applied, page])

  const apply = (next: Filters) => {
    setDraft(next)
    setApplied(next)
    setPage(0)
  }

  const onSelect = (name: keyof Filters, value: string) => apply({ ...draft, [name]: value })
  const onText = (name: keyof Filters, value: string) => setDraft({ ...draft, [name]: value })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    apply(draft)
    setDrawerOpen(false)
  }

  const clearAll = () => {
    apply({ ...emptyFilters })
    setDrawerOpen(false)
  }

  const activeCount = [
    applied.category,
    applied.location,
    applied.color,
    applied.brand,
    applied.status,
  ].filter(Boolean).length

  const items = data?.content || []
  const totalPages = data?.totalPages ?? 1
  const totalElements = data?.totalElements ?? items.length

  const FilterFields = (
    <div className="space-y-4">
      <div>
        <label className="input-label" htmlFor="f-category">
          Category
        </label>
        <select
          id="f-category"
          value={draft.category}
          onChange={(e) => onSelect('category', e.target.value)}
          className="input-field"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="input-label" htmlFor="f-status">
          Status
        </label>
        <select
          id="f-status"
          value={draft.status}
          onChange={(e) => onSelect('status', e.target.value)}
          className="input-field"
        >
          <option value="">Any status</option>
          <option value="AVAILABLE">Available</option>
          <option value="CLAIMED">Claimed</option>
          <option value="RETURNED">Returned</option>
        </select>
      </div>
      <div>
        <label className="input-label" htmlFor="f-location">
          Location
        </label>
        <input
          id="f-location"
          type="text"
          value={draft.location}
          onChange={(e) => onText('location', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(e)}
          placeholder="e.g. Library"
          className="input-field"
        />
      </div>
      <div>
        <label className="input-label" htmlFor="f-color">
          Colour
        </label>
        <input
          id="f-color"
          type="text"
          value={draft.color}
          onChange={(e) => onText('color', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(e)}
          placeholder="e.g. Black"
          className="input-field"
        />
      </div>
      <div>
        <label className="input-label" htmlFor="f-brand">
          Brand
        </label>
        <input
          id="f-brand"
          type="text"
          value={draft.brand}
          onChange={(e) => onText('brand', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(e)}
          placeholder="e.g. Samsung"
          className="input-field"
        />
      </div>
      <div>
        <label className="input-label" htmlFor="f-sort">
          Sort by
        </label>
        <select
          id="f-sort"
          value={draft.sort}
          onChange={(e) => onSelect('sort', e.target.value)}
          className="input-field"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <button type="button" onClick={submit} className="btn-primary w-full">
          Apply filters
        </button>
        <button type="button" onClick={clearAll} className="btn-secondary w-full">
          Clear all
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-page py-8 sm:py-10">
        {/* Breadcrumb + heading */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink-900">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink-900">Search</span>
        </nav>
        <div className="mt-2 flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            {applied.category ? `${applied.category} items` : 'Browse items'}
          </h1>
          <p className="text-gray-600" aria-live="polite">
            {loading
              ? 'Loading items…'
              : `${totalElements} item${totalElements === 1 ? '' : 's'} found`}
          </p>
        </div>

        {/* Search bar */}
        <form
          onSubmit={submit}
          className="card mt-6 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4"
          role="search"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={draft.keyword}
              onChange={(e) => onText('keyword', e.target.value)}
              placeholder="Search by item, brand, or description…"
              aria-label="Search items"
              className="w-full rounded-lg border border-hairline bg-white py-2.5 pl-11 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 sm:flex-none">
              Search
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn-secondary lg:hidden"
              aria-expanded={drawerOpen}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[11px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {applied.category && <FilterChip label={applied.category} onClear={() => onSelect('category', '')} />}
            {applied.status && <FilterChip label={applied.status} onClear={() => onSelect('status', '')} />}
            {applied.location && <FilterChip label={`Near ${applied.location}`} onClear={() => onSelect('location', '')} />}
            {applied.color && <FilterChip label={applied.color} onClear={() => onSelect('color', '')} />}
            {applied.brand && <FilterChip label={applied.brand} onClear={() => onSelect('brand', '')} />}
            <button onClick={clearAll} className="text-xs font-semibold text-primary-700 hover:text-primary-800">
              Clear all
            </button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          {/* Filters — desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="card sticky top-40 p-5">{FilterFields}</div>
          </aside>

          {/* Results */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
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
            ) : error ? (
              <div className="card p-10 text-center">
                <p className="text-lost">{error}</p>
                <button onClick={clearAll} className="btn-primary mt-4">
                  Reset filters
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={PackageSearch}
                  title="No items match your search"
                  description="Try adjusting the filters or searching for something else."
                  action={
                    <button onClick={clearAll} className="btn-primary">
                      Clear filters
                    </button>
                  }
                />
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.28) }}
                  >
                    <ItemCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-1.5"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-secondary btn-sm"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  if (totalPages > 7 && Math.abs(i - page) > 2 && i !== 0 && i !== totalPages - 1) {
                    if (i === 1 || i === totalPages - 2)
                      return (
                        <span key={i} className="px-1 text-sm text-gray-400">
                          …
                        </span>
                      )
                    return null
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      aria-current={page === i ? 'page' : undefined}
                      className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${
                        page === i
                          ? 'bg-primary-600 text-white'
                          : 'border border-hairline bg-white text-ink-800 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-secondary btn-sm"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-ink-900/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-[80] flex w-[88%] max-w-sm flex-col bg-white shadow-float lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
                <h2 className="font-display text-lg font-bold text-ink-900">Filters</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{FilterFields}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white py-1 pl-3 pr-1.5 text-xs font-medium text-ink-800">
      {label}
      <button
        onClick={onClear}
        aria-label={`Remove ${label} filter`}
        className="rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-ink-900"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  )
}