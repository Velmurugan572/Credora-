import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthenticatedUser } from '@/lib/auth'
import { getUserRecord } from '@/lib/db'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('credora_token')?.value
    const authUser = token ? getAuthenticatedUser(token) : null
    const userId = authUser ? authUser.id : 'usr_jordan_davis_01'

    const userRecord = getUserRecord(userId)

    if (!userRecord || !userRecord.hasData || !userRecord.scoringResult) {
      return NextResponse.json({
        success: true,
        hasData: false,
        telemetry: null
      })
    }

    return NextResponse.json({
      success: true,
      hasData: true,
      telemetry: userRecord.scoringResult
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch insights' }, { status: 500 })
  }
}
