import { Link } from 'react-router-dom'
import { MapPin, Calendar, ImageOff, ArrowUpRight } from 'lucide-react'
import StatusBadge from './ui/StatusBadge'

export interface ItemCardData {
  id: number
  title: string
  description?: string
  locationFound?: string
  lastSeenLocation?: string
  dateFound?: string
  status?: string
  categoryName?: string
  itemType?: string
  imageUrls?: string[]
  reporterName?: string
  createdAt?: string
}

export default function ItemCard({ item }: { item: ItemCardData }) {
  const cover = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null
  const place = item.locationFound || item.lastSeenLocation || 'Unknown location'

  const formattedDate = (() => {
    const raw = item.dateFound || item.createdAt
    if (!raw) return ''
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  })()

  return (
    <Link
      to={`/item/${item.id}`}
      className="card-hover group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {cover ? (
          <img
            src={cover}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-snap group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs font-medium">No photo</span>
          </div>
        )}
        <StatusBadge itemType={item.itemType} className="absolute left-3 top-3" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2">
          {item.categoryName && (
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-700">
              {item.categoryName}
            </span>
          )}
          {item.status && item.status !== 'AVAILABLE' && (
            <StatusBadge status={item.status} />
          )}
        </div>

        <h3 className="font-display text-base font-semibold leading-snug text-ink-900 line-clamp-2 transition-colors group-hover:text-primary-700 sm:text-lg">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">{item.description}</p>
        )}

        <div className="mt-3 space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="truncate">{place}</span>
          </div>
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
          <div className="flex min-w-0 items-center gap-2">
            {item.reporterName && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-700">
                {item.reporterName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate text-xs text-gray-500">
              {item.reporterName ? `Reported by ${item.reporterName}` : 'View details'}
            </span>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-primary-600 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}