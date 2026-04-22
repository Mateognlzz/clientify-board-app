'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createAdminActionTokens } from '@/services/admin.service'
import { sendUserRegisteredNotification } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function notifyAdminOfRegistrationAction(
  userId: string,
  fullName: string,
  email: string,
  skipPending: boolean = false
): Promise<void> {
  const adminEmails =
    process.env.PLATFORM_ADMIN_EMAILS?.split(',')
      .map((e) => e.trim())
      .filter(Boolean) ?? []

  if (adminEmails.length === 0 || skipPending) return

  const supabase = createAdminClient()

  // Mark user as pending approval
  await supabase.from('profiles').update({ status: 'pending' }).eq('id', userId)

  // Create one-click approve/reject tokens
  const { approveToken, rejectToken } = await createAdminActionTokens(supabase, userId)
  if (!approveToken || !rejectToken) return

  // Notify all admins
  for (const adminEmail of adminEmails) {
    void sendUserRegisteredNotification({
      toEmail: adminEmail,
      newUserName: fullName,
      newUserEmail: email,
      approveUrl: `${APP_URL}/admin-action?token=${approveToken}`,
      rejectUrl: `${APP_URL}/admin-action?token=${rejectToken}`,
    })
  }
}
