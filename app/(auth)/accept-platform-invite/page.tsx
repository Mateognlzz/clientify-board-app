import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlatformInvitationByToken, acceptPlatformInvitation } from '@/services/admin.service'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function AcceptPlatformInvitePage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <ErrorCard message="Invalid or incomplete invitation link." />
  }

  const adminSupabase = createAdminClient()
  const { data: invitation, error } = await getPlatformInvitationByToken(adminSupabase, token)

  if (error || !invitation) {
    return <ErrorCard message="This invitation does not exist or is no longer valid." />
  }

  if (invitation.accepted_at) {
    redirect('/dashboard')
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return <ErrorCard message="This invitation has expired. Ask the administrator to send a new one." />
  }

  const ssrSupabase = await createClient()
  const { data: { user } } = await ssrSupabase.auth.getUser()

  if (!user) {
    const registerUrl = `/register?platformInviteToken=${token}&email=${encodeURIComponent(invitation.email)}`
    const loginUrl = `/login?platformInviteToken=${token}&email=${encodeURIComponent(invitation.email)}`
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">You have been invited</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          You have been invited to join Clientify Projects.
        </p>
        <div className="space-y-3">
          <Link
            href={registerUrl}
            className="block w-full text-center py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create account and accept
          </Link>
          <Link
            href={loginUrl}
            className="block w-full text-center py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            I already have an account — Sign in
          </Link>
        </div>
        <p className="mt-5 text-center text-xs text-gray-400">
          This invitation was sent to <strong>{invitation.email}</strong>.
        </p>
      </div>
    )
  }

  if (!user.email) {
    return <ErrorCard message="Your account has no associated email. Contact the administrator." />
  }

  const result = await acceptPlatformInvitation(adminSupabase, token, user.id, user.email)

  if (result.error) {
    return <ErrorCard message={result.error} />
  }

  redirect('/dashboard')
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
