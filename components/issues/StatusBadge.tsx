import { cn } from '@/lib/utils/cn'
import type { IssueStatus } from '@/types/issue.types'

const STATUS_CONFIG: Record<IssueStatus, { label: string; className: string }> = {
  todo:                 { label: 'To Do',                className: 'bg-blue-100 text-blue-700' },
  in_progress:          { label: 'In Progress',          className: 'bg-yellow-100 text-yellow-700' },
  in_review:            { label: 'In Review',            className: 'bg-purple-100 text-purple-700' },
  staging_qa:           { label: 'Staging / QA',         className: 'bg-orange-100 text-orange-700' },
  ready_for_production: { label: 'Ready for Production', className: 'bg-teal-100 text-teal-700' },
  done:                 { label: 'Done',                 className: 'bg-green-100 text-green-700' },
  canceled:             { label: 'Canceled',             className: 'bg-red-100 text-red-500' },
  stopper:              { label: 'Stopper',              className: 'bg-red-200 text-red-700' },
}

export function StatusBadge({ status, color }: { status: string; color?: string }) {
  const config = STATUS_CONFIG[status as IssueStatus]
  if (color || !config) {
    const c = color ?? '#6b7280'
    return (
      <span
        style={{ backgroundColor: c + '22', color: c }}
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize"
      >
        {status.replace(/_/g, ' ')}
      </span>
    )
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
}

export function statusLabel(status: string): string {
  return STATUS_CONFIG[status as IssueStatus]?.label ?? status.replace(/_/g, ' ')
}

export const ALL_STATUSES: IssueStatus[] = ['todo', 'in_progress', 'in_review', 'staging_qa', 'ready_for_production', 'done', 'canceled', 'stopper']
