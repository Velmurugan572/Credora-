import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthenticatedUser } from '@/lib/auth'
import { getUserRecord, getDb, saveDb } from '@/lib/db'
import { calculateDynamicSimulation } from '@/lib/scoringEngine'

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
        simulation: null
      })
    }

    const db = getDb()
    const savedSim = db.simulations[userId]

    const result = calculateDynamicSimulation(
      userId,
      userRecord.scoringResult,
      savedSim?.savingsContribution || 25000,
      savedSim?.expenseVariance || 15,
      savedSim?.debtAllocation || 30
    )

    return NextResponse.json({
      success: true,
      hasData: true,
      simulation: result
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch simulation' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('credora_token')?.value
    const authUser = token ? getAuthenticatedUser(token) : null
    const userId = authUser ? authUser.id : 'usr_jordan_davis_01'

    const userRecord = getUserRecord(userId)

    if (!userRecord || !userRecord.hasData || !userRecord.scoringResult) {
      return NextResponse.json({
        success: false,
        error: 'Please upload transaction CSV data or link a bank account before running simulations.'
      }, { status: 400 })
    }

    const { savingsContribution, expenseVariance, debtAllocation } = await req.json()

    const s = typeof savingsContribution === 'number' ? savingsContribution : 25000
    const v = typeof expenseVariance === 'number' ? expenseVariance : 15
    const d = typeof debtAllocation === 'number' ? debtAllocation : 30

    const simulation = calculateDynamicSimulation(userId, userRecord.scoringResult, s, v, d)

    const db = getDb()
    db.simulations[userId] = {
      userId,
      savingsContribution: s,
      expenseVariance: v,
      debtAllocation: d,
      projectedScore: simulation.projectedScore,
      pointsGained: simulation.pointsGained,
      updatedAt: new Date().toISOString()
    }
    saveDb(db)

    return NextResponse.json({
      success: true,
      hasData: true,
      simulation
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to calculate simulation' }, { status: 500 })
  }
}
