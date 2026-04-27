'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, LogOut, Shield, Search, Package, Settings, Users, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useState, useEffect, useRef } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemCount = useCartStore((state) => state.getItemCount())
  const [mounted, setMounted] = useState(false)
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const adminMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Account'
  const userInitial = displayName.charAt(0).toUpperCase()

  const closeMenus = () => {
    setIsAdminMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true)
    })

    return () => cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setIsAdminMenuOpen(false)
      setIsUserMenuOpen(false)
    })

    return () => cancelAnimationFrame(frameId)
  }, [pathname])

  useEffect(() => {
    const currentSearch = searchParams.get('search') ?? ''
    const frameId = requestAnimationFrame(() => {
      setSearchQuery(currentSearch)
    })

    return () => cancelAnimationFrame(frameId)
  }, [searchParams])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node

      if (adminMenuRef.current && !adminMenuRef.current.contains(target)) {
        setIsAdminMenuOpen(false)
      }

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAdminMenuOpen(false)
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedSearch = searchQuery.trim()

    if (!trimmedSearch) {
      router.push('/products')
      return
    }

    router.push(`/products?search=${encodeURIComponent(trimmedSearch)}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🛍️Hello Gebeya
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminMenuOpen((currentValue) => !currentValue)
                    setIsUserMenuOpen(false)
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
                  aria-haspopup="menu"
                  aria-expanded={isAdminMenuOpen}
                >
                  <Shield size={16} />
                  Admin
                  <ChevronDown size={16} className={`transition ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAdminMenuOpen && (
                  <div className="absolute left-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                    <Link
                      href="/admin"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <Settings size={16} />
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/products"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <Package size={16} />
                      Products
                    </Link>
                    <Link
                      href="/admin/users"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <Users size={16} />
                      Users
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="flex items-center space-x-6">
            {mounted && (
              <form onSubmit={handleSearchSubmit} className="hidden items-center gap-2 md:flex">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    suppressHydrationWarning
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Search
                </button>
              </form>
            )}

            <Link href="/cart" className="relative">
              <ShoppingCart size={24} className="text-gray-700" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-gray-500">{session.user.role}</p>
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen((currentValue) => !currentValue)
                      setIsAdminMenuOpen(false)
                    }}
                    className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-blue-300"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {userInitial}
                    </span>
                    <ChevronDown size={16} className={`hidden text-slate-500 transition md:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="font-semibold text-slate-900">{displayName}</p>
                        <p className="text-sm text-slate-500">{session.user.email}</p>
                        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {session.user.role}
                        </span>
                      </div>

                      <Link
                        href="/profile"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        <ShoppingCart size={16} />
                        My Orders
                      </Link>
                      {session.user.role === 'ADMIN' && (
                        <>
                          <div className="my-2 border-t border-gray-100"></div>
                          <Link
                            href="/admin"
                            onClick={closeMenus}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                          >
                            <Shield size={16} />
                            Admin Panel
                          </Link>
                          <Link
                            href="/admin/products"
                            onClick={closeMenus}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                          >
                            <Package size={16} />
                            Manage Products
                          </Link>
                        </>
                      )}
                      <div className="my-2 border-t border-gray-100"></div>
                      <button
                        onClick={() => {
                          closeMenus()
                          signOut()
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
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
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
