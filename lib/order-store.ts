import 'server-only'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ensureDefaultProducts } from '@/lib/product-store'

type OrderAddress = {
  name: string
  email: string
  address: string
  city: string
  zipCode: string
  paymentMethod: string
}

export type OrderHistoryItem = {
  id: string
  productId: string
  name: string
  image: string
  quantity: number
  price: number
}

export type UserOrder = {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  paymentMethod: string
  shippingName: string
  shippingEmail: string
  shippingAddress: string
  items: OrderHistoryItem[]
}

type CreateOrderItem = {
  productId: string
  quantity: number
}

type CreateOrderInput = {
  userId: string
  items: CreateOrderItem[]
  shippingAddress: {
    name: string
    email: string
    address: string
    city: string
    zipCode: string
  }
  paymentMethod: string
}

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true
      }
    }
  }
}>

function normalizeStatus(status: string) {
  return status
    .trim()
    .toLowerCase()
}

export function formatOrderNumber(orderId: string) {
  return `SE-${orderId.slice(-8).toUpperCase()}`
}

function parseOrderAddress(value: Prisma.JsonValue): OrderAddress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      name: '',
      email: '',
      address: '',
      city: '',
      zipCode: '',
      paymentMethod: '',
    }
  }

  return {
    name: typeof value.name === 'string' ? value.name : '',
    email: typeof value.email === 'string' ? value.email : '',
    address: typeof value.address === 'string' ? value.address : '',
    city: typeof value.city === 'string' ? value.city : '',
    zipCode: typeof value.zipCode === 'string' ? value.zipCode : '',
    paymentMethod: typeof value.paymentMethod === 'string' ? value.paymentMethod : '',
  }
}

function mapOrder(order: OrderWithItems): UserOrder {
  const address = parseOrderAddress(order.address)
  const shippingAddress = [address.address, address.city, address.zipCode]
    .filter(Boolean)
    .join(', ')

  return {
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    total: order.total,
    status: normalizeStatus(order.status),
    createdAt: order.createdAt.toISOString(),
    paymentMethod: address.paymentMethod,
    shippingName: address.name,
    shippingEmail: address.email,
    shippingAddress,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.title,
      image: item.product.image,
      quantity: item.quantity,
      price: item.price,
    })),
  }
}

export async function listOrdersForUser(userId: string): Promise<UserOrder[]> {
  await ensureDefaultProducts()

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  return orders.map((order) => mapOrder(order))
}

export async function createOrder(input: CreateOrderInput): Promise<UserOrder> {
  await ensureDefaultProducts()

  const validItems = input.items
    .map((item) => ({
      productId: String(item.productId ?? '').trim(),
      quantity: Math.floor(Number(item.quantity)),
    }))
    .filter((item) => item.productId && item.quantity > 0)

  if (validItems.length === 0) {
    throw new Error('ORDER_ITEMS_REQUIRED')
  }

  const uniqueProductIds = [...new Set(validItems.map((item) => item.productId))]
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: uniqueProductIds,
      },
    },
  })

  if (products.length !== uniqueProductIds.length) {
    throw new Error('PRODUCT_NOT_FOUND')
  }

  const productsById = new Map(products.map((product) => [product.id, product]))

  const total = Number(
    validItems
      .reduce((sum, item) => {
        const product = productsById.get(item.productId)
        if (!product) {
          throw new Error('PRODUCT_NOT_FOUND')
        }

        return sum + product.price * item.quantity
      }, 0)
      .toFixed(2)
  )

  const address: Prisma.InputJsonObject = {
    name: input.shippingAddress.name.trim(),
    email: input.shippingAddress.email.trim(),
    address: input.shippingAddress.address.trim(),
    city: input.shippingAddress.city.trim(),
    zipCode: input.shippingAddress.zipCode.trim(),
    paymentMethod: input.paymentMethod.trim(),
  }

  const order = await prisma.order.create({
    data: {
      userId: input.userId,
      total,
      status: 'processing',
      address,
      items: {
        create: validItems.map((item) => {
          const product = productsById.get(item.productId)

          if (!product) {
            throw new Error('PRODUCT_NOT_FOUND')
          }

          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          }
        }),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  return mapOrder(order)
}
