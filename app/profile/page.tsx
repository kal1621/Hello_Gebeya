'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { KeyRound, LogOut, PencilLine, ShieldCheck, ShoppingBag, UserRound } from 'lucide-react'

type ProfileUser = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [nameForm, setNameForm] = useState({
    name: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    let isActive = true

    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile', { cache: 'no-store' })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load your profile')
        }

        if (isActive) {
          setProfileUser(data.user)
          setNameForm({ name: data.user.name })
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to load your profile')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchProfile()
    }

    return () => {
      isActive = false
    }
  }, [router, status])

  const displayName = profileUser?.name || session?.user?.name || 'Your Account'
  const displayEmail = profileUser?.email || session?.user?.email || ''
  const memberSince = useMemo(() => {
    if (!profileUser?.createdAt) {
      return 'Recently joined'
    }

    return new Date(profileUser.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
    })
  }, [profileUser?.createdAt])

  const clearMessages = () => {
    setError('')
    setSuccessMessage('')
  }

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    setSavingProfile(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nameForm.name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update your name')
      }

      setProfileUser(data.user)
      setNameForm({ name: data.user.name })
      await update({ name: data.user.name })
      setIsEditingName(false)
      setSuccessMessage('Your name has been updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update your name')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match')
      return
    }

    setSavingPassword(true)

    try {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update your password')
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setIsChangingPassword(false)
      setSuccessMessage('Your password has been updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update your password')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-500">Loading your profile...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid gap-8 lg:grid-cols-[0.85fr,1.15fr]">
          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{displayName}</h1>
                <p className="mt-1 text-slate-600">{displayEmail}</p>
                <p className="mt-1 text-sm text-slate-500">Member since {memberSince}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Account role</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{profileUser?.role || session.user.role}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Last updated</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {profileUser?.updatedAt
                    ? new Date(profileUser.updatedAt).toLocaleDateString()
                    : 'Today'}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => {
                  clearMessages()
                  setIsEditingName((currentValue) => !currentValue)
                  setIsChangingPassword(false)
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <PencilLine size={18} className="text-blue-600" />
                  <span className="font-medium text-slate-900">Edit Name</span>
                </div>
                <span className="text-sm text-slate-500">{isEditingName ? 'Close' : 'Open'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  clearMessages()
                  setIsChangingPassword((currentValue) => !currentValue)
                  setIsEditingName(false)
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <KeyRound size={18} className="text-blue-600" />
                  <span className="font-medium text-slate-900">Change Password</span>
                </div>
                <span className="text-sm text-slate-500">{isChangingPassword ? 'Close' : 'Open'}</span>
              </button>

              <Link
                href="/orders"
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={18} className="text-blue-600" />
                  <span className="font-medium text-slate-900">View Order History</span>
                </div>
                <span className="text-sm text-slate-500">Open</span>
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center justify-between rounded-2xl border border-red-200 px-4 py-4 text-left text-red-600 transition hover:bg-red-50"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
                </div>
                <span className="text-sm text-red-400">Exit</span>
              </button>
            </div>
          </section>

          <section className="space-y-6">
            {(error || successMessage) && (
              <div className={`rounded-2xl px-5 py-4 text-sm ${
                error
                  ? 'border border-red-200 bg-red-50 text-red-700'
                  : 'border border-green-200 bg-green-50 text-green-700'
              }`}>
                {error || successMessage}
              </div>
            )}

            {isEditingName ? (
              <form onSubmit={handleNameSave} className="rounded-3xl bg-white p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Edit Your Name</h2>
                  <p className="mt-2 text-slate-600">
                    Update the name shown across your account and header.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={nameForm.name}
                    onChange={(e) => setNameForm({ name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {savingProfile ? 'Saving...' : 'Save Name'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false)
                      setNameForm({ name: profileUser?.name || session.user.name || '' })
                      clearMessages()
                    }}
                    className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {isChangingPassword ? (
              <form onSubmit={handlePasswordSave} className="rounded-3xl bg-white p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
                  <p className="mt-2 text-slate-600">
                    Use your current password, then choose a new one with at least 6 characters.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((currentForm) => ({
                          ...currentForm,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((currentForm) => ({
                          ...currentForm,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((currentForm) => ({
                          ...currentForm,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      })
                      clearMessages()
                    }}
                    className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {!isEditingName && !isChangingPassword ? (
              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <UserRound size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Account Overview</h2>
                    <p className="mt-2 text-slate-600">
                      Your profile is now linked to the real registered account, not placeholder demo data.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Registered Name</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{displayName}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Email Address</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{displayEmail}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Security</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Password protected</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500">Checkout</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Ready for orders</p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                  Payment methods and shipping addresses can be added next if you want; for now, the important profile actions are live and connected to your real account.
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-blue-100 bg-blue-50 px-6 py-5 text-sm text-blue-700">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5" />
                <p>
                  Name changes update the account profile immediately, and password changes are saved securely for future logins.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
