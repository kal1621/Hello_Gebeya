'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Package, ShieldCheck, Star, Truck } from 'lucide-react'
import AddToCartButton from '@/components/AddToCartButton'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/types'

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [product, setProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function fetchProductData() {
      if (!productId) {
        setError('Product not found')
        setLoading(false)
        return
      }

      try {
        const [productResponse, productsResponse] = await Promise.all([
          fetch(`/api/products/${productId}`, { cache: 'no-store' }),
          fetch('/api/products', { cache: 'no-store' }),
        ])

        const productData = await productResponse.json()
        const productsData = await productsResponse.json()

        if (!productResponse.ok) {
          throw new Error(productData.message || 'Product not found')
        }

        if (!productsResponse.ok) {
          throw new Error(productsData.message || 'Unable to load products')
        }

        if (isActive) {
          setProduct(productData.product ?? null)
          setProducts(productsData.products ?? [])
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to load product')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchProductData()

    return () => {
      isActive = false
    }
  }, [productId])

  const relatedProducts = useMemo(() => {
    if (!product) {
      return []
    }

    return products
      .filter((item) => item.id !== product.id && item.category === product.category)
      .slice(0, 4)
  }, [product, products])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-500">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-red-700">{error || 'Product not found'}</p>
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-10">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to products
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
            <div className="relative aspect-square w-full">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                {product.category}
              </span>
              {product.featured && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-slate-900">{product.title}</h1>

            <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span>{product.rating.rate}</span>
              </div>
              <span>({product.rating.count} reviews)</span>
              <span>Stock: {product.stock}</span>
            </div>

            <p className="mt-6 text-3xl font-bold text-slate-900">${product.price.toFixed(2)}</p>
            <p className="mt-6 text-lg leading-8 text-slate-600">{product.description}</p>

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <Truck size={18} className="text-blue-600" />
                <p className="mt-2 font-semibold text-slate-900">Fast delivery</p>
                <p className="mt-1 text-sm text-slate-500">Ships within 24 hours.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <ShieldCheck size={18} className="text-blue-600" />
                <p className="mt-2 font-semibold text-slate-900">Secure checkout</p>
                <p className="mt-1 text-sm text-slate-500">Protected payment flow.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <Package size={18} className="text-blue-600" />
                <p className="mt-2 font-semibold text-slate-900">Easy returns</p>
                <p className="mt-1 text-sm text-slate-500">30-day return support.</p>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Related Products</h2>
              <Link href="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
