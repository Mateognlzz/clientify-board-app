import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getIssues } from '@/services/issues.service'
import { getSprints } from '@/services/sprints.service'
import { getProjectMembers } from '@/services/projects.service'
import { getEpics } from '@/services/epics.service'
import { KanbanBoard } from './KanbanBoard'

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function BoardPage({ params }: Props) {
  const { projectId } = await params

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

  return (
    <KanbanBoard
      projectId={projectId}
      currentUserId={user.id}
      canDelete={canDelete}
      issues={issues ?? []}
      sprints={sprints ?? []}
      members={members ?? []}
      epics={epics ?? []}
    />
  )
}
