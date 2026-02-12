'use client'

import { useState, useMemo } from 'react'
import ProductCard from '@/components/ProductCard'
import { Search, Filter } from 'lucide-react'

// Local mock products data with string IDs
const mockProducts = [
  {
    id: "1",
    title: "Wireless Bluetooth Headphones",
    description: "Noise cancelling over-ear headphones with premium sound quality",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: "Electronics",
    rating: { rate: 4.5, count: 120 }
  },
  {
    id: "2",
    title: "Smart Watch Series 5",
    description: "Fitness tracker with heart rate monitor and GPS",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    category: "Electronics",
    rating: { rate: 4.7, count: 89 }
  },
  {
    id: "3",
    title: "Premium Coffee Maker",
    description: "Programmable coffee maker with thermal carafe",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    category: "Home & Kitchen",
    rating: { rate: 4.3, count: 45 }
  },
  {
    id: "4",
    title: "Yoga Mat Premium",
    description: "Eco-friendly non-slip yoga mat with carrying strap",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400",
    category: "Fitness",
    rating: { rate: 4.8, count: 210 }
  },
  {
    id: "5",
    title: "Backpack Travel",
    description: "Water-resistant backpack with laptop compartment",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    category: "Travel",
    rating: { rate: 4.6, count: 78 }
  },
  {
    id: "6",
    title: "Desk Lamp LED",
    description: "Adjustable desk lamp with touch control and USB port",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    category: "Home Office",
    rating: { rate: 4.4, count: 56 }
  },
  {
    id: "7",
    title: "Running Shoes",
    description: "Lightweight running shoes with cushion technology",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    category: "Sports",
    rating: { rate: 4.5, count: 134 }
  },
  {
    id: "8",
    title: "Gaming Keyboard",
    description: "Mechanical gaming keyboard with RGB lighting",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400",
    category: "Electronics",
    rating: { rate: 4.6, count: 92 }
  }
]

export default function ProductsPage() {
  const [products] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading] = useState(false)

  // Get unique categories
  const categories = ['all', ...new Set(mockProducts.map(p => p.category))]

  // Use useMemo for filtering - better performance
  const filteredProducts = useMemo(() => {
    let filtered = [...products]
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      )
    }
    
    return filtered
  }, [searchTerm, selectedCategory, products])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Products</h1>
      <p className="text-gray-600 mb-8">Discover amazing products for every need</p>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Show count */}
      <div className="mt-8 text-center text-gray-500">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  )
}