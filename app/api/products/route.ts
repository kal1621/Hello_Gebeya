import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-store'
import { createProduct, listProducts } from '@/lib/product-store'

export const runtime = 'nodejs'

function parseProductPayload(body: Record<string, unknown>) {
  const title = String(body.title ?? '').trim()
  const description = String(body.description ?? '').trim()
  const category = String(body.category ?? '').trim()
  const image = String(body.image ?? '').trim()
  const price = Number(body.price)
  const stock = Number(body.stock)
  const featured = Boolean(body.featured)

  if (!title || !description || !category || !image) {
    throw new Error('MISSING_FIELDS')
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error('INVALID_PRICE')
  }

  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error('INVALID_STOCK')
  }

  return {
    title,
    description,
    category,
    image,
    price,
    stock,
    featured,
    rating: { rate: 4.5, count: 0 },
  }
}

export async function GET() {
  const products = await listProducts()
  return NextResponse.json({ products })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const product = await createProduct(parseProductPayload(body))

    return NextResponse.json(
      {
        message: 'Product added successfully',
        product,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'MISSING_FIELDS') {
        return NextResponse.json(
          { message: 'All product fields are required' },
          { status: 400 }
        )
      }

      if (error.message === 'INVALID_PRICE') {
        return NextResponse.json(
          { message: 'Price must be a valid number' },
          { status: 400 }
        )
      }

      if (error.message === 'INVALID_STOCK') {
        return NextResponse.json(
          { message: 'Stock must be a valid number' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Unable to save product right now' },
      { status: 500 }
    )
  }
}
