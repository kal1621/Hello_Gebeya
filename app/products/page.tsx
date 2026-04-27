'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { Search, Filter } from 'lucide-react'
import type { Product } from '@/lib/types'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function fetchProducts() {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load products')
        }

        if (isActive) {
          setProducts(data.products ?? [])
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to load products')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    const incomingSearch = searchParams.get('search')?.trim() ?? ''
    setSearchTerm(incomingSearch)
  }, [searchParams])

  const categories = useMemo(
    () => ['all', ...new Set(products.map((product) => product.category))],
    [products]
  )

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    return filtered
  }, [products, searchTerm, selectedCategory])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-4xl font-bold text-gray-900">Our Products</h1>
      <p className="mb-8 text-gray-600">Discover amazing products for every need</p>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="mb-4 h-64 rounded-lg bg-gray-200"></div>
              <div className="mb-2 h-4 rounded bg-gray-200"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-700">
          {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">No products found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-gray-500">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  )
}
