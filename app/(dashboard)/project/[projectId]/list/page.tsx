import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getIssues } from '@/services/issues.service'
import { getSprints } from '@/services/sprints.service'
import { getProjectMembers } from '@/services/projects.service'
import { getEpics } from '@/services/epics.service'
import { IssuesClient } from './IssuesClient'

interface Props {
  params: Promise<{ projectId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function IssuesListPage({ params, searchParams }: Props) {
  const { projectId } = await params
  const filters = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const [{ data: issues }, { data: sprints }, { data: members }, { data: epics }] = await Promise.all([
    getIssues(admin, projectId),
    getSprints(admin, projectId),
    getProjectMembers(supabase, projectId),
    getEpics(admin, projectId),
  ])

  const currentMember = (members ?? []).find((m) => m.user_id === user.id)
  const canDelete = currentMember?.role === 'owner' || currentMember?.role === 'admin'

  // Parse filter params (comma-separated values)
  function parseParam(key: string): string[] {
    const val = filters[key]
    if (!val) return []
    return Array.isArray(val) ? val : val.split(',').filter(Boolean)
  }

  return (
    <div className="p-6">
      <IssuesClient
        projectId={projectId}
        currentUserId={user.id}
        canDelete={canDelete}
        issues={issues ?? []}
        sprints={sprints ?? []}
        members={members ?? []}
        epics={epics ?? []}
        initialFilters={{
          statuses: parseParam('status'),
          priorities: parseParam('priority'),
          types: parseParam('type'),
          assignees: parseParam('assignee'),
          labels: parseParam('label'),
        }}
      />
    </div>
  )
}
