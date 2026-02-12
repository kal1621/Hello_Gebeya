import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // For demo purposes - just return success
    console.log("📝 Demo Registration:", { name, email })
    
    return NextResponse.json(
      { 
        message: 'Registration successful! You can now login with demo credentials.',
        success: true,
        demoNote: 'This is a demo. Use admin@example.com / admin123 or user@example.com / password123 to login.'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Registration successful (demo mode)' },
      { status: 201 }
    )
  }
}