import { SignOutButton } from '../_components/AutoSignOut'

export default function SuspendedPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Account suspended</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Your account has been suspended. Please contact your administrator for more information.
      </p>
      <SignOutButton />
    </div>
  )
}
