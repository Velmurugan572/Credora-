import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthenticatedUser } from '@/lib/auth'
import { getDb, saveDb, BankAccountRecord, getUserRecord, updateUserScoring } from '@/lib/db'
import { extractCashFlowFeatures } from '@/lib/featureExtraction'
import { calculateDeterministicScore } from '@/lib/scoringEngine'
import { TransactionRecord } from '@/lib/types'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('credora_token')?.value
    const authUser = token ? getAuthenticatedUser(token) : null
    const userId = authUser ? authUser.id : 'usr_jordan_davis_01'

    const db = getDb()
    const userAccounts = db.accounts.filter(a => a.userId === userId)

    return NextResponse.json({
      success: true,
      accounts: userAccounts
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('credora_token')?.value
    const authUser = token ? getAuthenticatedUser(token) : null
    const userId = authUser ? authUser.id : 'usr_jordan_davis_01'

    const db = getDb()
    const body = await req.json()

    if (body.action === 'toggle') {
      const { accountId } = body
      const accIndex = db.accounts.findIndex(a => a.id === accountId && a.userId === userId)
      if (accIndex !== -1) {
        db.accounts[accIndex].active = !db.accounts[accIndex].active
        db.accounts[accIndex].status = db.accounts[accIndex].active ? 'Connected' : 'Disconnected'
        saveDb(db)
      }
    } else {
      const { name, type, balance } = body
      const numBal = parseFloat((balance || '0').replace(/[^0-9.-]/g, '')) || 25000

      const newAcc: BankAccountRecord = {
        id: `acc_${Date.now()}`,
        userId,
        name: name || 'HDFC Bank Checking',
        type: type || 'Salary Account',
        balance: balance || '₹25,000.00',
        numericBalance: numBal,
        status: 'Connected',
        lastSynced: 'Just now',
        plaidId: `acc_aa_${Date.now()}`,
        active: true
      }

      db.accounts.push(newAcc)
      saveDb(db)

      // If user has no CSV data yet, generate synthetic 90-day transactions from bank link balance
      const userRecord = getUserRecord(userId)
      if (!userRecord?.hasData || !userRecord?.scoringResult) {
        const syntheticTxns = generateSyntheticTransactions(numBal)
        const features = extractCashFlowFeatures(syntheticTxns)
        const scoring = calculateDeterministicScore(features, userRecord?.occupation || 'Kirana Shop', [])
        updateUserScoring(userId, scoring, userRecord?.occupation || 'Kirana Shop', 'Account Aggregator Sync')
      }
    }

    const updatedAccounts = db.accounts.filter(a => a.userId === userId)
    return NextResponse.json({
      success: true,
      accounts: updatedAccounts
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add connection' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('credora_token')?.value
    const authUser = token ? getAuthenticatedUser(token) : null
    const userId = authUser ? authUser.id : 'usr_jordan_davis_01'

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('id')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
    }

    const db = getDb()
    db.accounts = db.accounts.filter(a => !(a.id === accountId && a.userId === userId))
    saveDb(db)

    const remainingAccounts = db.accounts.filter(a => a.userId === userId)
    return NextResponse.json({
      success: true,
      accounts: remainingAccounts
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete account' }, { status: 500 })
  }
}

function generateSyntheticTransactions(baseBalance: number): TransactionRecord[] {
  const txns: TransactionRecord[] = []
  const today = new Date()

  for (let i = 90; i >= 0; i -= 3) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    // Credit inflow
    txns.push({
      date: dateStr,
      amount: Math.round(3000 + Math.random() * 4000),
      direction: 'credit',
      counterparty: 'UPI QR Customer',
      description: 'Daily Business Settlement'
    })

    // Debit outflow
    txns.push({
      date: dateStr,
      amount: Math.round(2000 + Math.random() * 2500),
      direction: 'debit',
      counterparty: 'Wholesale Supplier',
      description: 'Stock Purchase'
    })
  }

  return txns
}
