import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-store'
import { createOrder } from '@/lib/order-store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: 'Please log in to place an order' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const order = await createOrder({
      userId: session.user.id,
      items: Array.isArray(body.items) ? body.items : [],
      shippingAddress: {
        name: String(body.shippingAddress?.name ?? ''),
        email: String(body.shippingAddress?.email ?? ''),
        address: String(body.shippingAddress?.address ?? ''),
        city: String(body.shippingAddress?.city ?? ''),
        zipCode: String(body.shippingAddress?.zipCode ?? ''),
      },
      paymentMethod: String(body.paymentMethod ?? ''),
    })

    return NextResponse.json(
      {
        message: 'Order placed successfully',
        order,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ORDER_ITEMS_REQUIRED') {
        return NextResponse.json(
          { message: 'Your cart is empty' },
          { status: 400 }
        )
      }

      if (error.message === 'PRODUCT_NOT_FOUND') {
        return NextResponse.json(
          { message: 'One or more products in your cart are no longer available' },
          { status: 400 }
        )
      }
    }

    console.error('Create order error:', error)

    return NextResponse.json(
      { message: 'Unable to place your order right now' },
      { status: 500 }
    )
  }
}
