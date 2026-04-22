import { SignOutButton } from '../_components/AutoSignOut'

export default function RejectedPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Access denied</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Your registration request was not approved. Please contact the platform administrator if you believe this is a mistake.
      </p>
      <SignOutButton />
    </div>
  )
}
