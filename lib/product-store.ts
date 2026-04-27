import 'server-only'
import { randomUUID } from 'crypto'
import type { Product as PrismaProduct } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { ProductInput, StoredProduct } from '@/lib/types'

const defaultProducts: ProductInput[] = [
  {
    title: 'Wireless Bluetooth Headphones',
    description: 'Noise cancelling over-ear headphones with premium sound quality',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'Electronics',
    stock: 50,
    featured: true,
    rating: { rate: 4.5, count: 120 },
  },
  {
    title: 'Smart Watch Series 5',
    description: 'Fitness tracker with heart rate monitor and GPS',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    category: 'Electronics',
    stock: 30,
    featured: true,
    rating: { rate: 4.7, count: 89 },
  },
  {
    title: 'Premium Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    category: 'Home & Kitchen',
    stock: 25,
    featured: false,
    rating: { rate: 4.3, count: 45 },
  },
  {
    title: 'Yoga Mat Premium',
    description: 'Eco-friendly non-slip yoga mat with carrying strap',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
    category: 'Fitness',
    stock: 80,
    featured: true,
    rating: { rate: 4.8, count: 210 },
  },
  {
    title: 'Backpack Travel',
    description: 'Water-resistant backpack with laptop compartment',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    category: 'Travel',
    stock: 40,
    featured: false,
    rating: { rate: 4.6, count: 78 },
  },
  {
    title: 'Desk Lamp LED',
    description: 'Adjustable desk lamp with touch control and USB port',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    category: 'Home Office',
    stock: 65,
    featured: false,
    rating: { rate: 4.4, count: 56 },
  },
  {
    title: 'Running Shoes',
    description: 'Lightweight running shoes with cushion technology',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    category: 'Sports',
    stock: 70,
    featured: false,
    rating: { rate: 4.5, count: 134 },
  },
  {
    title: 'Gaming Keyboard',
    description: 'Mechanical gaming keyboard with RGB lighting',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    category: 'Electronics',
    stock: 55,
    featured: true,
    rating: { rate: 4.6, count: 92 },
  },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function mapToStoredProduct(product: PrismaProduct): StoredProduct {
  return {
    ...product,
    rating: { rate: product.rating ?? 4.5, count: 0 },
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

let initializationPromise: Promise<void> | null = null

async function seedDefaultProducts() {
  const count = await prisma.product.count()
  if (count > 0) return

  for (const product of defaultProducts) {
    const id = `${slugify(product.title) || 'product'}-${randomUUID().slice(0, 8)}`
    await prisma.product.create({
      data: {
        id,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        image: product.image,
        category: product.category,
        stock: Math.max(0, Math.floor(product.stock)),
        featured: Boolean(product.featured),
        rating: product.rating?.rate ?? 4.5,
      }
    })
  }
}

export async function ensureDefaultProducts() {
  if (!initializationPromise) {
    initializationPromise = seedDefaultProducts().catch((error) => {
      initializationPromise = null
      throw error
    })
  }
  return initializationPromise
}

export async function listProducts(): Promise<StoredProduct[]> {
  await ensureDefaultProducts()
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return products.map(mapToStoredProduct)
}

export async function listFeaturedProducts(limit = 4): Promise<StoredProduct[]> {
  await ensureDefaultProducts()
  const products = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
  return products.map(mapToStoredProduct)
}

export async function getProductById(id: string): Promise<StoredProduct | null> {
  await ensureDefaultProducts()
  const product = await prisma.product.findUnique({
    where: { id }
  })
  return product ? mapToStoredProduct(product) : null
}

export async function createProduct(product: ProductInput): Promise<StoredProduct> {
  await ensureDefaultProducts()
  const id = `${slugify(product.title) || 'product'}-${randomUUID().slice(0, 8)}`
  const newProduct = await prisma.product.create({
    data: {
      id,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      image: product.image,
      category: product.category,
      stock: Math.max(0, Math.floor(product.stock)),
      featured: Boolean(product.featured),
      rating: product.rating?.rate ?? 4.5,
    }
  })
  return mapToStoredProduct(newProduct)
}

export async function updateProduct(id: string, updates: ProductInput): Promise<StoredProduct | null> {
  await ensureDefaultProducts()
  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: updates.title,
        description: updates.description,
        price: Number(updates.price),
        image: updates.image,
        category: updates.category,
        stock: Math.max(0, Math.floor(updates.stock)),
        featured: Boolean(updates.featured),
        rating: updates.rating?.rate,
      }
    })
    return mapToStoredProduct(updatedProduct)
  } catch {
    return null
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  await ensureDefaultProducts()
  try {
    await prisma.product.delete({
      where: { id }
    })
    return true
  } catch {
    return false
  }
}
