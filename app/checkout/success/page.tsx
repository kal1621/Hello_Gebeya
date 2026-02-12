'use client'

import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function CheckoutSuccessPage() {
  useEffect(() => {
    // Clear cart on success page load
    // Note: We'll clear cart in the checkout page instead
  }, [])

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
      
      <h1 className="text-4xl font-bold mb-4">Order Placed Successfully!</h1>
      
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Thank you for your purchase. Your order has been confirmed and will be 
        shipped within 2-3 business days. You will receive an email confirmation 
        shortly with tracking information.
      </p>
      
      <div className="space-x-4">
        <Link 
          href="/products" 
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
        >
          Continue Shopping
        </Link>
        
        <Link 
          href="/orders" 
          className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 inline-block"
        >
          View Orders
        </Link>
      </div>
    </div>
  )
}