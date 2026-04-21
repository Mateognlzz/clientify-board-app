import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getInvitationByToken, acceptInvitation } from '@/services/members.service'
import { revalidatePath } from 'next/cache'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <ErrorCard message="Invalid or incomplete invitation link." />
  }

  const adminSupabase = createAdminClient()
  const { data: invitation, error } = await getInvitationByToken(adminSupabase, token)

  if (error || !invitation) {
    return <ErrorCard message="This invitation does not exist or is no longer valid." />
  }

  if (invitation.accepted_at) {
    return <ErrorCard message="This invitation has already been accepted." />
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return <ErrorCard message="This invitation has expired. Ask the project administrator to send a new one." />
  }

  const projectName = invitation.project?.name ?? 'a project'
  const inviterName = invitation.inviter?.full_name ?? 'Someone'

  const ssrSupabase = await createClient()
  const { data: { user } } = await ssrSupabase.auth.getUser()

  if (user) {
    if (!user.email) return <ErrorCard message="Your account has no associated email. Contact the administrator." />
    const result = await acceptInvitation(adminSupabase, token, user.id, user.email)

    if (result.error) {
      return <ErrorCard message={result.error} />
    }

    revalidatePath(`/project/${result.data!.projectId}/members`)
    redirect(`/project/${result.data!.projectId}/board`)
  }

  const registerUrl = `/register?inviteToken=${token}&email=${encodeURIComponent(invitation.email)}`
  const loginUrl = `/login?inviteToken=${token}&email=${encodeURIComponent(invitation.email)}`

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">You have an invitation</h2>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-700 space-y-1">
        <p><span className="text-gray-400">From:</span> <strong>{inviterName}</strong></p>
        <p><span className="text-gray-400">Project:</span> <strong>{projectName}</strong></p>
        <p><span className="text-gray-400">To:</span> <strong>{invitation.email}</strong></p>
        <p><span className="text-gray-400">Role:</span> <strong className="capitalize">{invitation.role}</strong></p>
      </div>

      <div className="space-y-3">
        <Link
          href={registerUrl}
          className="block w-full text-center py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg
                     hover:bg-blue-700 transition-colors"
        >
          Create account and accept
        </Link>
        <Link
          href={loginUrl}
          className="block w-full text-center py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg
                     hover:bg-gray-50 transition-colors"
        >
          I already have an account — Sign in
        </Link>
      </div>

      <p className="mt-5 text-center text-xs text-gray-400">
        This invitation was sent to <strong>{invitation.email}</strong>.<br />
        You must use that email address to access.
      </p>
    </div>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid invitation</h2>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <Link
        href="/login"
        className="inline-block px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to sign in
      </Link>
    </div>
  )
}
