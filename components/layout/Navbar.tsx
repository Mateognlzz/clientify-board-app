'use client'

import { User } from 'lucide-react'
import type { UserProfile } from '@/types/auth.types'

interface NavbarProps {
  profile: UserProfile | null
  breadcrumb?: React.ReactNode
}

export function Navbar({ profile, breadcrumb }: NavbarProps) {
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-5 gap-4 shrink-0">
      <div className="flex-1 min-w-0">
        {breadcrumb ?? null}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {profile?.full_name && (
          <span className="text-sm text-gray-600 hidden sm:block">
            {profile.full_name}
          </span>
        )}

        {/* Avatar */}
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name ?? 'Avatar'}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <div
            className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-gray-100"
            aria-label="Avatar de usuario"
          >
            {initials !== '?' ? (
              <span className="text-white text-xs font-semibold">{initials}</span>
            ) : (
              <User size={14} className="text-white" />
            )}
          </div>
        )}


      </div>
    </header>
  )
}
