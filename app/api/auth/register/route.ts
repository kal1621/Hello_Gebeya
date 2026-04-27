import { NextResponse } from 'next/server'
import { createUser } from '@/lib/auth-store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()
    const trimmedEmail = email?.trim()
    const trimmedName = name?.trim()

    if (!trimmedEmail || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const user = await createUser({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role: 'USER',
    })

    return NextResponse.json(
      {
        message: 'Registration successful',
        success: true,
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_ALREADY_EXISTS') {
      return NextResponse.json(
        { message: 'An account with that email already exists' },
        { status: 409 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Unable to create your account right now' },
      { status: 500 }
    )
  }
}
