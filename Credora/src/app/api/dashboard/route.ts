import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthenticatedUser } from '@/lib/auth'
import { getDb, getUserRecord } from '@/lib/db'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('credora_token')?.value

    const authUser = token ? getAuthenticatedUser(token) : null
    const userId = authUser ? authUser.id : null

    if (!userId || !authUser) {
      return NextResponse.json({
        success: true,
        hasAccounts: false,
        hasData: false,
        activeAccountsCount: 0,
        user: {
          id: '',
          name: 'Guest Visitor',
          email: '',
          occupation: 'Kirana Shop',
          language: 'en',
          hasData: false
        },
        telemetry: {
          score: 0,
          maxScore: 900,
          tier: 'Guest Visitor',
          topPercent: 'Sign In Required',
          scoreMovement: 0,
          factor_breakdown: null,
          anomaly_flags: []
        },
        accounts: []
      })
    }

    const db = getDb()
    const userRecord = getUserRecord(userId)
    const userAccounts = db.accounts.filter(a => a.userId === userId && a.active)

    const hasAccounts = userAccounts.length > 0 || (userRecord?.hasData ?? false)

    if (!userRecord || !userRecord.hasData || !userRecord.scoringResult) {
      return NextResponse.json({
        success: true,
        hasAccounts: false,
        hasData: false,
        activeAccountsCount: userAccounts.length,
        user: {
          id: userId,
          name: authUser.name || userRecord?.name || 'New Member',
          email: authUser.email || userRecord?.email || '',
          occupation: userRecord?.occupation || 'Kirana Shop',
          language: userRecord?.language || 'en',
          hasData: false
        },
        telemetry: {
          score: 0,
          maxScore: 900,
          tier: 'New Member',
          topPercent: 'Pending Onboarding',
          scoreMovement: 0,
          factor_breakdown: null,
          anomaly_flags: []
        },
        accounts: userAccounts
      })
    }

    return NextResponse.json({
      success: true,
      hasAccounts: true,
      hasData: true,
      activeAccountsCount: userAccounts.length,
      user: {
        id: userId,
        name: userRecord.name,
        email: userRecord.email,
        occupation: userRecord.occupation,
        language: userRecord.language,
        hasData: true,
        uploadedFileName: userRecord.uploadedFileName
      },
      telemetry: userRecord.scoringResult,
      accounts: userAccounts
    })
  } catch (err: any) {
    console.error('Error fetching dashboard data:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
