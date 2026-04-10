'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const CHANNEL = 'clientify:refresh'

/**
 * Cross-tab refresh coordination via BroadcastChannel.
 *
 * When this tab regains focus:
 *   1. Runs onFocus immediately (e.g. close modals)
 *   2. Calls router.refresh() to get fresh server data
 *   3. Broadcasts 'refreshed' so OTHER open tabs also update their UI
 *      without triggering another Supabase auth round-trip themselves.
 *
 * When another tab broadcasts 'refreshed':
 *   - This tab updates silently via router.refresh() (no auth lock contention
 *     because we are in the background and not initiating the session check).
 *
 * Fallback: if BroadcastChannel is unavailable (old Safari, private mode)
 *   the hook degrades gracefully — just does a local refresh on focus.
 */
export function useRefreshOnFocus(onFocus?: () => void) {
  const router = useRouter()
  // Keep callback ref stable so the effect doesn't re-run when onFocus changes
  const onFocusRef = useRef(onFocus)
  onFocusRef.current = onFocus

  useEffect(() => {
    let channel: BroadcastChannel | null = null

    try {
      channel = new BroadcastChannel(CHANNEL)

      // Another tab did a refresh → silently sync this tab too
      channel.onmessage = (e: MessageEvent) => {
        if (e.data === 'refreshed') {
          router.refresh()
        }
      }
    } catch {
      // BroadcastChannel not available — degrade gracefully
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return

      onFocusRef.current?.()
      router.refresh()
      // Tell other open tabs to sync — they will NOT call auth independently
      channel?.postMessage('refreshed')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      channel?.close()
    }
  }, [router]) // router is stable — effect runs once
}
