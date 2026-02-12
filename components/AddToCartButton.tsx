'use client'

import { useCartStore } from '@/store/cartStore'
import { ShoppingCart } from 'lucide-react'

interface Product {
  id: number
  title: string
  price: number
  image: string
  category: string
}

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)
  
  const handleAddToCart = () => {
    addItem({
      id: product.id.toString(),
      name: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    })
    
    // Optional: Show toast notification
    console.log('Added to cart:', product.title)
  }
  
  return (
    <button 
      onClick={handleAddToCart}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105"
    >
      <ShoppingCart size={18} />
      <span>Add to Cart</span>
    </button>
  )
}