import { TransactionRecord, ExtractedFeatures } from './types'

export function extractCashFlowFeatures(transactions: TransactionRecord[]): ExtractedFeatures {
  if (!transactions || transactions.length === 0) {
    return {
      totalCredits: 0,
      totalDebits: 0,
      netFlow: 0,
      avgMonthlyIncome: 0,
      avgMonthlyExpense: 0,
      incomeVolatility: 0,
      savingsRatio: 0,
      expenseVariance: 0,
      paymentConsistencyScore: 0,
      repaymentCapacityRatio: 0,
      financialRiskIndex: 0,
      thinBufferDays: 0,
      recurringDebitsCount: 0,
      totalTransactionCount: 0,
      daysOfData: 0
    }
  }

  const credits = transactions.filter(t => t.direction === 'credit')
  const debits = transactions.filter(t => t.direction === 'debit')

  const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0)
  const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0)
  const netFlow = totalCredits - totalDebits

  // Calculate timeframe in days and months
  const startDate = new Date(transactions[0].date)
  const endDate = new Date(transactions[transactions.length - 1].date)
  const daysOfData = Math.max(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)), 1)
  const monthsOfData = Math.max(daysOfData / 30, 0.5)

  const avgMonthlyIncome = totalCredits / monthsOfData
  const avgMonthlyExpense = totalDebits / monthsOfData

  // 1. Income Volatility (Coefficient of Variation = stdDev / mean)
  // Group credits into weekly buckets
  const weeklyCredits = groupIntoTimeBuckets(credits, 7)
  const incomeVolatility = calculateCoefficientOfVariation(weeklyCredits)

  // 2. Savings Ratio: Ratio of retained credits vs spent (0 - 1)
  const savingsRatio = totalCredits > 0 ? Math.max(Math.min((totalCredits - totalDebits) / totalCredits, 1), 0) : 0

  // 3. Expense Variance: Coefficient of Variation of weekly debits
  const weeklyDebits = groupIntoTimeBuckets(debits, 7)
  const expenseVariance = calculateCoefficientOfVariation(weeklyDebits)

  // 4. Payment Consistency (Regularity of recurring debits like rent, EMI, utilities)
  const recurringDebits = detectRecurringDebits(debits)
  const paymentConsistencyScore = Math.min(Math.round(60 + recurringDebits.length * 15), 98)

  // 5. Repayment Capacity Ratio: Disposable cash flow remaining relative to income
  const disposableIncome = Math.max(avgMonthlyIncome - avgMonthlyExpense, 0)
  const repaymentCapacityRatio = avgMonthlyIncome > 0 ? disposableIncome / avgMonthlyIncome : 0

  // 6. Thin buffer days (days where calculated running balance < ₹1,000)
  let currentBalance = 15000 // initial buffer assumption
  let thinBufferDays = 0

  transactions.forEach(t => {
    if (t.runningBalance !== undefined) {
      currentBalance = t.runningBalance
    } else {
      if (t.direction === 'credit') currentBalance += t.amount
      else currentBalance -= t.amount
    }
    if (currentBalance < 1000) {
      thinBufferDays += 1
    }
  })

  // Financial Risk Index (0 to 100, lower is better)
  let riskPts = 10
  if (thinBufferDays > 10) riskPts += 40
  else if (thinBufferDays > 5) riskPts += 25
  else if (thinBufferDays > 0) riskPts += 12

  if (incomeVolatility > 0.45) riskPts += 25
  else if (incomeVolatility > 0.30) riskPts += 15

  if (savingsRatio < 0.05) riskPts += 20

  const financialRiskIndex = Math.min(riskPts, 100)

  return {
    totalCredits,
    totalDebits,
    netFlow,
    avgMonthlyIncome,
    avgMonthlyExpense,
    incomeVolatility,
    savingsRatio,
    expenseVariance,
    paymentConsistencyScore,
    repaymentCapacityRatio,
    financialRiskIndex,
    thinBufferDays,
    recurringDebitsCount: recurringDebits.length,
    totalTransactionCount: transactions.length,
    daysOfData
  }
}

function groupIntoTimeBuckets(records: TransactionRecord[], bucketDays: number): number[] {
  if (records.length === 0) return [0]
  const buckets: Record<number, number> = {}
  const firstTime = new Date(records[0].date).getTime()
  const bucketMs = bucketDays * 24 * 3600 * 1000

  records.forEach(r => {
    const time = new Date(r.date).getTime()
    const index = Math.floor((time - firstTime) / bucketMs)
    buckets[index] = (buckets[index] || 0) + r.amount
  })

  return Object.values(buckets)
}

function calculateCoefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  if (mean === 0) return 0

  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  return stdDev / mean
}

function detectRecurringDebits(debits: TransactionRecord[]): { amount: number; count: number }[] {
  const amountCounts: Record<number, number> = {}
  debits.forEach(d => {
    // Round to nearest 100 for recurring matching
    const rounded = Math.round(d.amount / 50) * 50
    if (rounded >= 500) {
      amountCounts[rounded] = (amountCounts[rounded] || 0) + 1
    }
  })

  return Object.entries(amountCounts)
    .filter(([_, count]) => count >= 2)
    .map(([amt, count]) => ({ amount: parseFloat(amt), count }))
}
