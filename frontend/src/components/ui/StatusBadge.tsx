interface StatusBadgeProps {
  itemType?: string
  status?: string
  className?: string
}

const statusClass: Record<string, string> = {
  AVAILABLE: 'badge-available',
  CLAIMED: 'badge-claimed',
  RETURNED: 'badge-returned',
}

const pretty = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

/** LOST / FOUND type badge + lifecycle status badge. */
export default function StatusBadge({ itemType, status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {itemType && (
        <span
          className={`badge ${
            itemType === 'LOST'
              ? 'badge-lost'
              : itemType === 'FOUND'
              ? 'badge-found'
              : 'badge-neutral'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              itemType === 'LOST'
                ? 'bg-lost'
                : itemType === 'FOUND'
                ? 'bg-found'
                : 'bg-gray-400'
            }`}
          />
          {itemType}
        </span>
      )}
      {status && (
        <span className={`badge ${statusClass[status] || 'badge-neutral'}`}>
          {pretty(status)}
        </span>
      )}
    </span>
  )
}