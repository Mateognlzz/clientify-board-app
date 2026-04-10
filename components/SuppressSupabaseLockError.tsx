'use client'

import { useEffect } from 'react'

/**
 * Suppresses the known Supabase gotrue-js cross-tab Web Lock race error.
 * This is a benign error that occurs when multiple tabs share the same
 * Supabase auth token lock — one tab "steals" it from another during
 * concurrent refreshes. Supabase recovers automatically; we just silence it.
 * https://github.com/supabase/gotrue-js/issues/1130
 */
export function SuppressSupabaseLockError() {
  useEffect(() => {
    function handler(event: PromiseRejectionEvent) {
      if (event.reason?.message?.includes('Lock') && event.reason?.message?.includes('released')) {
        event.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])

  return null
}
