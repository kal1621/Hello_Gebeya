import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, getUserById, updateUserName } from '@/lib/auth-store'

export const runtime = 'nodejs'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const user = await getUserById(session.user.id)

  if (!user) {
    return NextResponse.json(
      { message: 'User not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { name } = await request.json()
    const user = await updateUserName(session.user.id, String(name ?? ''))

    return NextResponse.json({
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_NAME') {
        return NextResponse.json(
          { message: 'Please enter a valid name' },
          { status: 400 }
        )
      }

      if (error.message === 'USER_NOT_FOUND') {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Unable to update profile right now' },
      { status: 500 }
    )
  }
}
