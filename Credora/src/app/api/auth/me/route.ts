import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('credora_token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 })
    }

    const user = getAuthenticatedUser(token)
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        memberSince: user.memberSince,
        plan: 'Pro Cash Flow'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 })
  }
}
