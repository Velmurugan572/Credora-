import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { hashPassword, createSessionToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const db = getDb()
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const inputHash = hashPassword(password, user.salt)
    if (inputHash !== user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = createSessionToken(user.id, user.email, user.name)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        memberSince: user.memberSince,
        plan: 'Pro Cash Flow'
      }
    })

    response.cookies.set('credora_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    return response
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signin failed' }, { status: 500 })
  }
}
