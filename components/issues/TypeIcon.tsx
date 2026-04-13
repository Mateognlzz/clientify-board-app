import { Bug, Star, CheckSquare, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { IssueType } from '@/types/issue.types'

const TYPE_CONFIG: Record<IssueType, { label: string; icon: React.ReactNode; className: string }> = {
  bug:         { label: 'Bug',         icon: <Bug size={13} />,         className: 'text-red-500' },
  feature:     { label: 'Feature',     icon: <Star size={13} />,        className: 'text-blue-500' },
  task:        { label: 'Task',        icon: <CheckSquare size={13} />, className: 'text-gray-500' },
  improvement: { label: 'Improvement', icon: <TrendingUp size={13} />,  className: 'text-purple-500' },
}

export function TypeIcon({ type, showLabel = false }: { type: string; showLabel?: boolean }) {
  const config = TYPE_CONFIG[type as IssueType]
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1 text-gray-400" title={type}>
        <CheckSquare size={13} />
        {showLabel && <span className="text-xs capitalize">{type.replace(/_/g, ' ')}</span>}
      </span>
    )
  }
  return (
    <span className={cn('inline-flex items-center gap-1', config.className)} title={config.label}>
      {config.icon}
      {showLabel && <span className="text-xs">{config.label}</span>}
    </span>
  )
}

export function typeLabel(type: string): string {
  return TYPE_CONFIG[type as IssueType]?.label ?? type.replace(/_/g, ' ')
}

export const ALL_TYPES: IssueType[] = ['bug', 'feature', 'task', 'improvement']
