import 'server-only'
import path from 'path'
import { readFile } from 'fs/promises'
import bcrypt from 'bcryptjs'
import type { User as PrismaUser } from '@prisma/client'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

type UserRole = 'ADMIN' | 'USER'

export type PublicUser = {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
}

const defaultUsers = [
  {
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    email: 'user@example.com',
    name: 'Regular User',
    password: 'password123',
    role: 'USER',
  },
]

let initializationPromise: Promise<void> | null = null

type LegacyUserRecord = {
  email: string
  name: string
  password: string
  role: UserRole
  createdAt?: Date
  updatedAt?: Date
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeName(name: string | undefined | null, email: string) {
  const trimmedName = name?.trim()
  if (trimmedName) return trimmedName
  const emailPrefix = email.split('@')[0]?.replace(/[._-]+/g, ' ') ?? 'User'
  return emailPrefix
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function toPublicUser(user: PrismaUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name || '',
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

function parseOptionalDate(value: unknown) {
  if (typeof value !== 'string') return undefined

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined
  }

  return parsedDate
}

async function readLegacyUsers(): Promise<LegacyUserRecord[]> {
  const legacyUsersPath = path.join(process.cwd(), 'data', 'users.json')

  try {
    const legacyUsersFile = await readFile(legacyUsersPath, 'utf8')
    const parsedUsers: unknown = JSON.parse(legacyUsersFile)

    if (!Array.isArray(parsedUsers)) {
      return []
    }

    return parsedUsers.flatMap((entry) => {
      if (!entry || typeof entry !== 'object') {
        return []
      }

      const email = typeof entry.email === 'string' ? normalizeEmail(entry.email) : ''
      const password = typeof entry.password === 'string' ? entry.password : ''

      if (!email || !password) {
        return []
      }

      const role: UserRole = entry.role === 'ADMIN' ? 'ADMIN' : 'USER'

      return [
        {
          email,
          name:
            typeof entry.name === 'string' && entry.name.trim()
              ? entry.name.trim()
              : normalizeName(undefined, email),
          password,
          role,
          createdAt: parseOptionalDate(entry.createdAt),
          updatedAt: parseOptionalDate(entry.updatedAt),
        },
      ]
    })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return []
    }

    console.error('Legacy user import failed:', error)
    return []
  }
}

async function migrateLegacyUsers() {
  const legacyUsers = await readLegacyUsers()

  for (const user of legacyUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (existingUser) {
      continue
    }

    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        ...(user.createdAt ? { createdAt: user.createdAt } : {}),
        ...(user.updatedAt ? { updatedAt: user.updatedAt } : {}),
      },
    })
  }
}

async function seedDefaultUsers() {
  for (const user of defaultUsers) {
    const email = normalizeEmail(user.email)
    const exists = await prisma.user.findUnique({ where: { email } })
    if (!exists) {
      await prisma.user.create({
        data: {
          email,
          name: user.name,
          password: await bcrypt.hash(user.password, 10),
          role: user.role,
        }
      })
    }
  }
}

export async function ensureDefaultUsers() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await migrateLegacyUsers()
      await seedDefaultUsers()
    })().catch((error) => {
      initializationPromise = null
      throw error
    })
  }
  return initializationPromise
}

export async function getUserByEmail(email: string) {
  await ensureDefaultUsers()
  const normalizedEmail = normalizeEmail(email)
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  return user
}

export async function getUserById(id: string) {
  await ensureDefaultUsers()
  const user = await prisma.user.findUnique({ where: { id } })
  return user
}

export async function validateCredentials(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) return null

  const passwordMatches = await bcrypt.compare(password, user.password)
  if (!passwordMatches) return null

  return toPublicUser(user)
}

export async function createUser({
  email,
  password,
  name,
  role = 'USER',
}: {
  email: string
  password: string
  name?: string
  role?: UserRole
}) {
  await ensureDefaultUsers()
  const normalizedEmail = normalizeEmail(email)
  
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existingUser) {
    throw new Error('USER_ALREADY_EXISTS')
  }

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: normalizeName(name, normalizedEmail),
      password: await bcrypt.hash(password, 10),
      role,
    }
  })

  return toPublicUser(newUser)
}

export async function listUsers(): Promise<PublicUser[]> {
  await ensureDefaultUsers()
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return users.map(toPublicUser)
}

export async function updateUserName(userId: string, name: string) {
  await ensureDefaultUsers()
  const trimmedName = name.trim()
  if (!trimmedName) {
    throw new Error('INVALID_NAME')
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: trimmedName }
    })
    return toPublicUser(updatedUser)
  } catch {
    throw new Error('USER_NOT_FOUND')
  }
}

export async function updateUserPassword({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string
  currentPassword: string
  newPassword: string
}) {
  await ensureDefaultUsers()
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  const currentPasswordMatches = await bcrypt.compare(currentPassword, user.password)
  if (!currentPasswordMatches) {
    throw new Error('INVALID_CURRENT_PASSWORD')
  }

  if (newPassword.length < 6) {
    throw new Error('INVALID_NEW_PASSWORD')
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(newPassword, 10) }
  })
  return toPublicUser(updatedUser)
}

export function getDefaultLoginHints(): Array<{ email: string; password: string; role: string }> {
  return defaultUsers.map(({ email, password, role }) => ({
    email,
    password,
    role,
  }))
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await validateCredentials(credentials.email, credentials.password)
        if (!user) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-12345',
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.name = user.name
      }
      if (trigger === 'update' && session?.name) {
        token.name = session.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.role = token.role as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
