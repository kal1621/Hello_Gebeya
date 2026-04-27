'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { CreditCard, Landmark, ShieldCheck, Truck, Wallet } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

type PaymentMethod = 'card' | 'paypal' | 'cod'

const paymentOptions: Array<{
  id: PaymentMethod
  title: string
  description: string
  icon: typeof CreditCard
}> = [
  {
    id: 'card',
    title: 'Credit / Debit Card',
    description: 'Pay securely with Visa, Mastercard, or other major cards.',
    icon: CreditCard,
  },
  {
    id: 'paypal',
    title: 'PayPal',
    description: 'Use your PayPal email for a quick and familiar checkout.',
    icon: Wallet,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    description: 'Pay when your order reaches your door.',
    icon: Truck,
  },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'card' as PaymentMethod,
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: '',
  })

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true)
    })

    return () => cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    setFormData((currentFormData) => ({
      ...currentFormData,
      name: currentFormData.name || session.user.name || '',
      email: currentFormData.email || session.user.email || '',
    }))
  }, [session?.user?.email, session?.user?.name, status])

  const subtotal = getTotalPrice()
  const tax = useMemo(() => subtotal * 0.08, [subtotal])
  const total = subtotal + tax

  const paymentLabel = useMemo(() => {
    const selectedOption = paymentOptions.find((option) => option.id === formData.paymentMethod)
    return selectedOption?.title ?? 'Payment'
  }, [formData.paymentMethod])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [e.target.name]: e.target.value,
    }))
  }

  const handlePaymentMethodChange = (paymentMethod: PaymentMethod) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      paymentMethod,
    }))
  }

  const validatePaymentDetails = () => {
    if (formData.paymentMethod === 'card') {
      if (!formData.cardHolder || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        return 'Please complete your card details'
      }
    }

    if (formData.paymentMethod === 'paypal' && !formData.paypalEmail) {
      return 'Please enter your PayPal email'
    }

    return ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!session?.user?.id) {
      setError('Please log in to place your order')
      return
    }

    const paymentError = validatePaymentDetails()

    if (paymentError) {
      setError(paymentError)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: {
            name: formData.name,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            zipCode: formData.zipCode,
          },
          paymentMethod: paymentLabel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to place your order')
      }

      clearCart()
      router.push(
        `/checkout/success?order=${encodeURIComponent(data.order.orderNumber)}&payment=${encodeURIComponent(paymentLabel)}`
      )
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to place your order')
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-500">Preparing checkout...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Your cart is empty</h1>
        <button
          onClick={() => router.push('/products')}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Shop Now
        </button>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-500">Checking your account...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Login required</h1>
        <p className="mx-auto mb-6 max-w-xl text-gray-600">
          Please log in before checkout so your order is saved to your account and appears in
          your order history.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go to Login
          </Link>
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Cart
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold">Shipping Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Payment Method</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ShieldCheck size={16} className="text-green-600" />
                  Secure checkout
                </div>
              </div>

              <div className="space-y-3">
                {paymentOptions.map((option) => {
                  const OptionIcon = option.icon

                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                        formData.paymentMethod === option.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.id}
                        checked={formData.paymentMethod === option.id}
                        onChange={() => handlePaymentMethodChange(option.id)}
                        className="mt-1"
                      />
                      <div className="rounded-lg bg-white p-2 shadow-sm">
                        <OptionIcon size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{option.title}</p>
                        <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                      </div>
                    </label>
                  )
                })}
              </div>

              {formData.paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Name on Card</label>
                    <input
                      type="text"
                      name="cardHolder"
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.paymentMethod === 'card'}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.paymentMethod === 'card'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={formData.paymentMethod === 'card'}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={formData.paymentMethod === 'card'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'paypal' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">PayPal Email</label>
                    <input
                      type="email"
                      name="paypalEmail"
                      value={formData.paypalEmail}
                      onChange={handleInputChange}
                      placeholder="you@paypal.com"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.paymentMethod === 'paypal'}
                    />
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    You&apos;ll complete the payment with your PayPal account after placing the order.
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'cod' && (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Cash on delivery is available for eligible addresses. Please keep the exact amount ready when your order arrives.
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </form>
        </div>

        <div>
          <div className="sticky top-24 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-6 text-xl font-bold">Order Summary</h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative mr-3 h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Landmark size={16} className="text-blue-600" />
                    Payment
                  </div>
                  <span className="font-medium text-slate-900">{paymentLabel}</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="mt-8 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Processing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
