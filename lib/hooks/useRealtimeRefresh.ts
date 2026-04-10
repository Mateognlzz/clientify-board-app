'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Subscribes to Supabase Realtime postgres_changes for a given project.
 * Any INSERT/UPDATE/DELETE on `issues` or `comments` for this project
 * triggers router.refresh() — which re-fetches server data and updates the UI
 * for ALL connected users without manual reload.
 *
 * Uses the browser singleton client so there is only one WebSocket connection
 * per tab regardless of how many components call this hook.
 */
export function useRealtimeRefresh(projectId: string) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
          filter: `project_id=eq.${projectId}`,
        },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        () => router.refresh()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId, router])
}
