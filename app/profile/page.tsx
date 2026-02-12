export default function ProfilePage() {
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    joinDate: 'January 2024',
    ordersCount: 3,
    totalSpent: 539.95
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>My Profile</h1>
      
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#0070f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '32px',
            marginRight: '20px'
          }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0' }}>{user.name}</h2>
            <p style={{ margin: '0', color: '#666' }}>{user.email}</p>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              Member since {user.joinDate}
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0070f3' }}>
              {user.ordersCount}
            </div>
            <div style={{ color: '#666' }}>Total Orders</div>
          </div>
          
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0070f3' }}>
              ${user.totalSpent.toFixed(2)}
            </div>
            <div style={{ color: '#666' }}>Total Spent</div>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px' }}>Account Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{
              padding: '12px',
              textAlign: 'left',
              backgroundColor: 'transparent',
              border: '1px solid #e0e0e0',
              borderRadius: '4px'
            }}>
              Edit Profile Information
            </button>
            <button style={{
              padding: '12px',
              textAlign: 'left',
              backgroundColor: 'transparent',
              border: '1px solid #e0e0e0',
              borderRadius: '4px'
            }}>
              Change Password
            </button>
            <button style={{
              padding: '12px',
              textAlign: 'left',
              backgroundColor: 'transparent',
              border: '1px solid #e0e0e0',
              borderRadius: '4px'
            }}>
              Payment Methods
            </button>
            <button style={{
              padding: '12px',
              textAlign: 'left',
              backgroundColor: 'transparent',
              border: '1px solid #e0e0e0',
              borderRadius: '4px'
            }}>
              Shipping Addresses
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}>
            View Order History
          </button>
          <button style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: '#dc3545',
            border: '1px solid #dc3545',
            borderRadius: '4px'
          }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}