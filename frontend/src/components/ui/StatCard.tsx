import { LucideIcon } from 'lucide-react'
import AnimatedCounter from './AnimatedCounter'

type Tone = 'primary' | 'lost' | 'found' | 'warning' | 'teal'

const tones: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary-600',
  lost: 'bg-red-50 text-lost',
  found: 'bg-emerald-50 text-found',
  warning: 'bg-amber-50 text-amber-600',
  teal: 'bg-teal-50 text-returned',
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  tone?: Tone
  hint?: string
}

export default function StatCard({ icon: Icon, label, value, tone = 'primary', hint }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        <AnimatedCounter value={value} />
      </p>
      <p className="mt-0.5 text-sm font-medium text-gray-600">{label}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}