import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Package, Shield, Users } from 'lucide-react'
import { authOptions, getDefaultLoginHints, listUsers } from '@/lib/auth-store'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const users = await listUsers()
  const adminUsers = users.filter((user) => user.role === 'ADMIN')
  const recentUsers = users.slice(0, 4)
  const adminHint = getDefaultLoginHints().find((user) => user.role === 'ADMIN')

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-100">
              <Shield size={16} />
              Admin Control Center
            </div>
            <h1 className="text-4xl font-bold">Store admin access is live</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Your admin role now persists correctly, and the dashboard links point to real pages instead of dead routes.
            </p>
          </div>

          {adminHint && (
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm text-slate-100">
              <p className="font-semibold">Seeded admin login</p>
              <p className="mt-1">{adminHint.email}</p>
              <p>{adminHint.password}</p>
            </div>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Registered users</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">{users.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Admin accounts</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">{adminUsers.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Products section</p>
            <Link
              href="/admin/products"
              className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-blue-600 transition hover:text-blue-700"
            >
              <Package size={18} />
              Open product manager
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Latest users</h2>
                <p className="text-sm text-slate-500">Recent signups and their current role.</p>
              </div>
              <Link href="/admin/users" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                View all users
              </Link>
            </div>

            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.role === 'ADMIN'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Quick links</h2>
            <div className="mt-5 space-y-3">
              <Link
                href="/admin/users"
                className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-4 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <Users size={18} />
                Manage users
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-4 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <Package size={18} />
                Manage products
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
