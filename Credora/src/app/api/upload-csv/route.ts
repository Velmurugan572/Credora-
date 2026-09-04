import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthenticatedUser } from '@/lib/auth'
import { updateUserScoring, getDb } from '@/lib/db'
import { parseTransactionCSV } from '@/lib/csvParser'
import { extractCashFlowFeatures } from '@/lib/featureExtraction'
import { detectAnomalies } from '@/lib/anomalyDetection'
import { calculateDeterministicScore } from '@/lib/scoringEngine'
import { Occupation } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('credora_token')?.value
    const authUser = token ? getAuthenticatedUser(token) : null
    const userId = authUser ? authUser.id : 'usr_jordan_davis_01'

    const body = await req.json()
    const { csvContent, occupation, fileName, name } = body

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json({ success: false, error: 'CSV file content is required.' }, { status: 400 })
    }

    const selectedOccupation: Occupation = occupation || 'Kirana Shop'

    // 1. Validate & parse CSV
    const parseResult = parseTransactionCSV(csvContent)
    if (!parseResult.success || parseResult.transactions.length === 0) {
      return NextResponse.json({
        success: false,
        error: parseResult.error || 'Failed to parse CSV file.'
      }, { status: 400 })
    }

    // 2. Feature Extraction
    const features = extractCashFlowFeatures(parseResult.transactions)

    // 3. Anomaly Detection
    const anomalies = detectAnomalies(parseResult.transactions, features.thinBufferDays)

    // 4. Deterministic Scoring Engine
    const scoringResult = calculateDeterministicScore(features, selectedOccupation, anomalies)

    // 5. Update DB
    const updatedUser = updateUserScoring(userId, scoringResult, selectedOccupation, fileName || '90day_transactions.csv', name)

    return NextResponse.json({
      success: true,
      scoringResult,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        hasData: updatedUser.hasData,
        occupation: updatedUser.occupation,
        uploadedFileName: updatedUser.uploadedFileName
      }
    })
  } catch (err: any) {
    console.error('Error processing CSV upload:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 })
  }
}
