'use client'

import { useCartStore } from '@/store/cartStore'
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()
  const [isClearing, setIsClearing] = useState(false)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={64} className="text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Looks like you have not added any products to your cart yet.
          </p>
          <Link 
            href="/products" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transform transition-all duration-300 inline-flex items-center"
          >
            <span>Start Shopping</span>
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    )
  }

  const handleClearCart = () => {
    setIsClearing(true)
    setTimeout(() => {
      clearCart()
      setIsClearing(false)
    }, 300)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 mt-2">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleClearCart}
          className="text-red-500 hover:text-red-700 font-medium flex items-center gap-2 transition-colors"
          disabled={isClearing}
        >
          <Trash2 size={20} />
          {isClearing ? 'Clearing...' : 'Clear Cart'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Product Image */}
                <div className="w-28 h-28 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}  // Changed from item.product.image to item.image
                    alt={item.name}   // Changed from item.product.title to item.name
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 ml-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors">
                        {item.name}  {/* Changed from item.product.title to item.name */}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {/* Removed category since it's not in cart store */}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${item.price.toFixed(2)}  {/* Changed from item.product.price to item.price */}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium text-lg">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-6">
                      <p className="text-xl font-bold text-blue-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${getTotalPrice().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
              
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Tax (8%)</span>
                <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${(getTotalPrice() * 1.08).toFixed(2)}</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">Including tax and shipping</p>
              </div>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center mt-8"
            >
              <span>Proceed to Checkout</span>
              <span className="ml-2">→</span>
            </Link>

            <Link 
              href="/products" 
              className="block text-center text-blue-600 hover:text-blue-800 font-medium mt-4 hover:underline transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}