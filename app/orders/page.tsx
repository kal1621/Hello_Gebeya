import Link from 'next/link'
export default function OrdersPage() {
  // Mock order data
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      total: 149.99,
      status: 'Delivered',
      items: [
        { name: 'Fjallraven Backpack', quantity: 1, price: 109.95 },
        { name: 'Mens Casual Shirt', quantity: 1, price: 22.50 },
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      total: 89.99,
      status: 'Processing',
      items: [
        { name: 'Wireless Headphones', quantity: 1, price: 89.99 }
      ]
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      total: 299.97,
      status: 'Delivered',
      items: [
        { name: 'Smart Watch', quantity: 1, price: 199.99 },
        { name: 'Phone Case', quantity: 2, price: 49.99 }
      ]
    }
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No orders yet</p>
          <Link href="/products" style={{ color: '#0070f3', textDecoration: 'none' }}>
  Start Shopping
</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div 
              key={order.id} 
              style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px',
                padding: '20px'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '15px',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: '10px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>Order #{order.id}</h3>
                  <p style={{ margin: '0', color: '#666' }}>Placed on {order.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    padding: '4px 12px', 
                    backgroundColor: order.status === 'Delivered' ? '#d4edda' : '#fff3cd',
                    color: order.status === 'Delivered' ? '#155724' : '#856404',
                    borderRadius: '20px',
                    display: 'inline-block',
                    fontSize: '14px'
                  }}>
                    {order.status}
                  </div>
                  <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Items:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.items.map((item, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '8px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px'
                      }}
                    >
                      <span>{item.name}</span>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <span>Qty: {item.quantity}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#0070f3', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}>
                  View Details
                </button>
                <button style={{ 
                  padding: '8px 16px', 
                  backgroundColor: 'transparent', 
                  color: '#0070f3',
                  border: '1px solid #0070f3',
                  borderRadius: '4px'
                }}>
                  Buy Again
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}