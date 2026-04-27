import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-store'
import { deleteProduct, getProductById, updateProduct } from '@/lib/product-store'

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
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return NextResponse.json(
      { message: 'Product not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ product })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const product = await updateProduct(id, parseProductPayload(body))

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    })
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
      { message: 'Unable to update product right now' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 403 }
    )
  }

  const { id } = await params
  const deleted = await deleteProduct(id)

  if (!deleted) {
    return NextResponse.json(
      { message: 'Product not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ message: 'Product deleted successfully' })
}
