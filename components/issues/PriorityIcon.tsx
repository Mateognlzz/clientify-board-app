import { ArrowDown, ArrowDownToLine, Minus, ArrowUp, ArrowUpToLine } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { IssuePriority } from '@/types/issue.types'

const PRIORITY_CONFIG: Record<IssuePriority, { label: string; icon: React.ReactNode; className: string }> = {
  lowest: { label: 'Lowest', icon: <ArrowDownToLine size={13} />, className: 'text-blue-400' },
  low:    { label: 'Low',    icon: <ArrowDown size={13} />,       className: 'text-green-500' },
  medium: { label: 'Medium', icon: <Minus size={13} />,           className: 'text-yellow-500' },
  high:   { label: 'High',   icon: <ArrowUp size={13} />,         className: 'text-orange-500' },
  highest: { label: 'Highest', icon: <ArrowUpToLine size={13} />, className: 'text-red-500' },
}

export function PriorityIcon({ priority, showLabel = false }: { priority: IssuePriority; showLabel?: boolean }) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span className={cn('inline-flex items-center gap-1', config.className)} title={config.label}>
      {config.icon}
      {showLabel && <span className="text-xs">{config.label}</span>}
    </span>
  )
}

export function priorityLabel(priority: IssuePriority): string {
  return PRIORITY_CONFIG[priority]?.label ?? priority
}

export const ALL_PRIORITIES: IssuePriority[] = ['lowest', 'low', 'medium', 'high', 'highest']
