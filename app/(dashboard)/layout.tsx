import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import type { UserProfile } from '@/types/auth.types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profileResult, membersResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('project_members')
      .select('project_id, role')
      .eq('user_id', user.id),
  ])

  const profile = profileResult.data as UserProfile | null

  const memberRows = (membersResult.data ?? []) as Array<{ project_id: string; role: string }>
  const projectIds = memberRows.map((m) => m.project_id)
  const ownerProjectIds = memberRows.filter((m) => m.role === 'owner').map((m) => m.project_id)

  const { data: projects } =
    projectIds.length > 0
      ? await supabase
          .from('projects')
          .select('id, name, key')
          .in('id', projectIds)
          .order('name')
      : { data: [] }

  const projectList = (projects ?? []) as Array<{
    id: string
    name: string
    key: string
  }>

  const adminEmails =
    process.env.PLATFORM_ADMIN_EMAILS?.split(',')
      .map((e) => e.trim())
      .filter(Boolean) ?? []
  const isSuperAdmin = user.email ? adminEmails.includes(user.email) : false

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        projects={projectList}
        ownerProjectIds={ownerProjectIds}
        isSuperAdmin={isSuperAdmin}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar profile={profile} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
