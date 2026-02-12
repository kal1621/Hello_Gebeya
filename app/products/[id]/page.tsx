'use client'

import { useState, useEffect } from 'react'
import { Filter, Search } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types'

// Mock categories (you can get these from API)
const categories = [
  'All',
  'electronics',
  'jewelery', 
  "men's clothing",
  "women's clothing"
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('https://fakestoreapi.com/products')
        const data = await res.json()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Apply filters whenever search, category, or price changes
  useEffect(() => {
    let filtered = products

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Apply price filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, priceRange, products])

  // Get max price for range slider
  const maxPrice = Math.max(...products.map(p => p.price), 1000)

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>All Products</h1>
        <p style={{ color: '#666' }}>
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ 
        marginBottom: '30px',
        position: 'relative'
      }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 20px 12px 45px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
        <Search 
          size={20} 
          style={{ 
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Filters Sidebar */}
        <div style={{ 
          width: '250px',
          flexShrink: 0,
          display: showFilters ? 'block' : 'none'
        }}>
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button 
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                  setPriceRange([0, maxPrice])
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#0070f3',
                  cursor: 'pointer'
                }}
              >
                Clear all
              </button>
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Category</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: selectedCategory === category ? '#0070f3' : '#f5f5f5',
                      color: selectedCategory === category ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '4px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Price Range</h4>
              <div style={{ padding: '0 5px' }}>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  style={{ width: '100%' }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginTop: '5px',
                  color: '#666'
                }}>
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h4 style={{ margin: '0 0 10px 0' }}>Sort By</h4>
              <select 
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                onChange={(e) => {
                  const sorted = [...filteredProducts]
                  if (e.target.value === 'price-low') {
                    sorted.sort((a, b) => a.price - b.price)
                  } else if (e.target.value === 'price-high') {
                    sorted.sort((a, b) => b.price - a.price)
                  } else if (e.target.value === 'name') {
                    sorted.sort((a, b) => a.title.localeCompare(b.title))
                  }
                  setFilteredProducts(sorted)
                }}
              >
                <option value="">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ flex: 1 }}>
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 15px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginBottom: '20px',
              cursor: 'pointer'
            }}
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Active Filters Display */}
          {(selectedCategory !== 'All' || searchQuery || priceRange[1] < maxPrice) && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}>
              {selectedCategory !== 'All' && (
                <div style={{
                  padding: '5px 10px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('All')}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              
              {searchQuery && (
                <div style={{
                  padding: '5px 10px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              
              {priceRange[1] < maxPrice && (
                <div style={{
                  padding: '5px 10px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  Price: up to ${priceRange[1]}
                  <button
                    onClick={() => setPriceRange([0, maxPrice])}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                No products found
              </p>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                  setPriceRange([0, maxPrice])
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}