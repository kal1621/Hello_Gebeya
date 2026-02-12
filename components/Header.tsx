'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, LogOut, Shield, Search, Package, Settings, Users } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useState, useEffect } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const itemCount = useCartStore((state) => state.getItemCount())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
  const frameId = requestAnimationFrame(() => {
    setMounted(true)
  })

  return () => cancelAnimationFrame(frameId)
}, [])

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ❤️ShopEasy
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <div className="relative group">
                <button className="text-gray-700 hover:text-blue-600 flex items-center">
                  <Shield size={16} className="mr-1" />
                  Admin
                  <span className="ml-1">▼</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible z-50">
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={16} className="mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/products"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Package size={16} className="mr-2" />
                    Products
                  </Link>
                  <Link
                    href="/admin/users"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Users size={16} className="mr-2" />
                    Users
                  </Link>
                </div>
              </div>
            )}
          </nav>

          {/* Auth & Cart */}
          <div className="flex items-center space-x-6">
            {/* Search - Only on client */}
            {mounted && (
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    suppressHydrationWarning
                  />
                </div>
              </div>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingCart size={24} className="text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-gray-500">{session.user.role}</p>
                </div>
                <div className="relative group">
                  <button className="p-2 bg-gray-100 rounded-full">
                    <User size={20} />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible z-50">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      My Orders
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <Shield size={16} className="mr-2" />
                          Admin Panel
                        </Link>
                        <Link
                          href="/admin/products"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <Package size={16} className="mr-2" />
                          Manage Products
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}