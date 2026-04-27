export interface ProductRating {
  rate: number
  count: number
}

export interface Product {
  id: string
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: ProductRating
  stock: number
  featured: boolean
}

export interface StoredProduct extends Product {
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  title: string
  price: number
  description: string
  category: string
  image: string
  stock: number
  featured?: boolean
  rating?: ProductRating
}
