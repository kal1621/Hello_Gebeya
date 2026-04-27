'use client'

import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') ?? 'SE-00000000'
  const paymentMethod = searchParams.get('payment') ?? 'Payment confirmed'

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle size={80} className="mx-auto mb-6 text-green-500" />

      <h1 className="mb-4 text-4xl font-bold">Order Placed Successfully!</h1>

      <p className="mx-auto mb-6 max-w-2xl text-gray-600">
        Thank you for your purchase. Your order has been confirmed and will be
        shipped within 2-3 business days. You will receive an email confirmation
        shortly with tracking information.
      </p>

      <div className="mx-auto mb-8 max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-5 text-left shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-sm text-slate-500">Order Number</span>
          <span className="font-semibold text-slate-900">{orderNumber}</span>
        </div>
        <div className="flex items-center justify-between pt-3">
          <span className="text-sm text-slate-500">Payment Method</span>
          <span className="font-semibold text-slate-900">{paymentMethod}</span>
        </div>
      </div>

      <div className="space-x-4">
        <Link
          href="/products"
          className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Continue Shopping
        </Link>

        <Link
          href="/orders"
          className="inline-block rounded-lg border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 hover:bg-blue-50"
        >
          View Orders
        </Link>
      </div>
    </div>
  )
}
