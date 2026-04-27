import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, updateUserPassword } from '@/lib/auth-store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { currentPassword, newPassword } = await request.json()

    await updateUserPassword({
      userId: session.user.id,
      currentPassword: String(currentPassword ?? ''),
      newPassword: String(newPassword ?? ''),
    })

    return NextResponse.json({
      message: 'Password updated successfully',
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_CURRENT_PASSWORD') {
        return NextResponse.json(
          { message: 'Your current password is incorrect' },
          { status: 400 }
        )
      }

      if (error.message === 'INVALID_NEW_PASSWORD') {
        return NextResponse.json(
          { message: 'New password must be at least 6 characters' },
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
      { message: 'Unable to update password right now' },
      { status: 500 }
    )
  }
}
