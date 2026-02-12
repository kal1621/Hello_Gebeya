export default function LoadingSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1.5rem',
      padding: '1rem'
    }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{
            height: '200px',
            backgroundColor: '#e5e7eb'
          }} />
          <div style={{ padding: '1rem' }}>
            <div style={{
              height: '1rem',
              backgroundColor: '#e5e7eb',
              marginBottom: '0.5rem',
              borderRadius: '0.25rem'
            }} />
            <div style={{
              height: '1rem',
              width: '70%',
              backgroundColor: '#e5e7eb',
              marginBottom: '1rem',
              borderRadius: '0.25rem'
            }} />
            <div style={{
              height: '2rem',
              width: '50%',
              backgroundColor: '#e5e7eb',
              borderRadius: '0.25rem'
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}