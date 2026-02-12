'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Package, Users, ShoppingBag, TrendingUp, Plus, Edit, List } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const statsCards = [
    {
      title: 'Total Products',
      value: 24,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products'
    },
    {
      title: 'Total Users',
      value: 156,
      icon: Users,
      color: 'bg-green-500',
      link: '/admin/users'
    },
    {
      title: 'Total Orders',
      value: 89,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      link: '/admin/orders'
    },
    {
      title: 'Total Revenue',
      value: '$12,456',
      icon: TrendingUp,
      color: 'bg-amber-500',
      link: '/admin/revenue'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                ADMIN
              </span>
              <Link 
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                View Store
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Link
              key={index}
              href={stat.link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                href="/admin/products/new"
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Plus className="text-blue-600" size={20} />
                  <span className="font-medium">Add New Product</span>
                </div>
                <span className="text-blue-600">→</span>
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <List className="text-green-600" size={20} />
                  <span className="font-medium">Manage Products</span>
                </div>
                <span className="text-green-600">→</span>
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="text-purple-600" size={20} />
                  <span className="font-medium">Manage Orders</span>
                </div>
                <span className="text-purple-600">→</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-amber-600" size={20} />
                  <span className="font-medium">View All Users</span>
                </div>
                <span className="text-amber-600">→</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">New order placed</p>
                  <p className="text-sm text-gray-500">5 minutes ago</p>
                </div>
                <span className="text-green-600 font-semibold">$129.99</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">New user registered</p>
                  <p className="text-sm text-gray-500">15 minutes ago</p>
                </div>
                <span className="text-blue-600 font-semibold">User</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Product stock updated</p>
                  <p className="text-sm text-gray-500">1 hour ago</p>
                </div>
                <span className="text-amber-600 font-semibold">Wireless Headphones</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">New product added</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
                <span className="text-blue-600 font-semibold">Gaming Keyboard</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}