import { SignOutButton } from '../_components/AutoSignOut'

export default function PendingApprovalPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-yellow-50 mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Account pending approval</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Your account is waiting for administrator approval. You will receive an email once your access has been granted.
      </p>
      <SignOutButton />
    </div>
  )
}
