import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-store'
import { listOrdersForUser } from '@/lib/order-store'

function formatStatus(status: string) {
  return status
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getStatusClassName(status: string) {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-700'
    case 'cancelled':
      return 'bg-red-100 text-red-700'
    case 'processing':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const orders = await listOrdersForUser(session.user.id)

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">My Orders</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Order History</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              This page now shows only the orders placed by your signed-in account.
            </p>
          </div>
          <Link
            href="/products"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl bg-white px-8 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              You have not placed any orders with this account yet. When you complete checkout,
              your order will appear here automatically.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Start Shopping
              </Link>
              <Link
                href="/profile"
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Order Number</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">{order.orderNumber}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Placed on{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClassName(order.status)}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                    <p className="mt-3 text-2xl font-bold text-slate-900">${order.total.toFixed(2)}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.items.reduce((count, item) => count + item.quantity, 0)} item(s)
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Items</h3>
                    <div className="mt-3 space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-slate-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Delivery Details
                    </h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Name</p>
                        <p className="mt-1 font-medium text-slate-900">{order.shippingName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                        <p className="mt-1 font-medium text-slate-900">{order.shippingEmail || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Address</p>
                        <p className="mt-1 font-medium text-slate-900">{order.shippingAddress || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Payment</p>
                        <p className="mt-1 font-medium text-slate-900">{order.paymentMethod || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
