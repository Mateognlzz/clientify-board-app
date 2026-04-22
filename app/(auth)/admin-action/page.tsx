import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getAdminActionToken,
  markAdminTokenUsed,
  setUserStatus,
} from '@/services/admin.service'
import { sendUserApprovedNotification, sendUserRejectedNotification } from '@/lib/email'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function AdminActionPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <ResultCard type="error" message="Missing token." />
  }

  const supabase = createAdminClient()
  const { data: actionToken, error } = await getAdminActionToken(supabase, token)

  if (error || !actionToken) {
    return <ResultCard type="error" message="Invalid or expired token." />
  }

  if (actionToken.used_at) {
    return (
      <ResultCard
        type="info"
        message={`This action has already been applied to ${actionToken.target_user?.email ?? 'the user'}.`}
      />
    )
  }

  if (new Date(actionToken.expires_at) < new Date()) {
    return <ResultCard type="error" message="This token has expired." />
  }

  const targetUser = actionToken.target_user
  const userName = targetUser?.full_name ?? targetUser?.email ?? 'the user'

  if (actionToken.action === 'approve') {
    await setUserStatus(supabase, actionToken.target_user_id, 'active')
    await markAdminTokenUsed(supabase, actionToken.id)

    if (targetUser?.email) {
      void sendUserApprovedNotification({
        toEmail: targetUser.email,
        toName: targetUser.full_name ?? targetUser.email,
      })
    }

    return (
      <ResultCard
        type="success"
        message={`${userName} has been approved and can now access the platform.`}
      />
    )
  }

  if (actionToken.action === 'reject') {
    await setUserStatus(supabase, actionToken.target_user_id, 'rejected')
    await markAdminTokenUsed(supabase, actionToken.id)

    if (targetUser?.email) {
      void sendUserRejectedNotification({
        toEmail: targetUser.email,
        toName: targetUser.full_name ?? targetUser.email,
      })
    }

    return (
      <ResultCard
        type="warning"
        message={`${userName}'s registration has been rejected. They have been notified.`}
      />
    )
  }

  return <ResultCard type="error" message="Unknown action." />
}

function ResultCard({ type, message }: { type: 'success' | 'error' | 'warning' | 'info'; message: string }) {
  const styles = {
    success: { bg: 'bg-green-50', stroke: '#22c55e', title: 'Done' },
    error: { bg: 'bg-red-50', stroke: '#ef4444', title: 'Error' },
    warning: { bg: 'bg-yellow-50', stroke: '#f59e0b', title: 'Done' },
    info: { bg: 'bg-blue-50', stroke: '#3b82f6', title: 'Already applied' },
  }[type]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${styles.bg} mb-4`}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={styles.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {type === 'success' || type === 'info' ? (
            <><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></>
          ) : type === 'warning' ? (
            <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
          ) : (
            <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>
          )}
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{styles.title}</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{message}</p>
      <Link
        href="/admin"
        className="inline-block px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Admin panel
      </Link>
    </div>
  )
}
