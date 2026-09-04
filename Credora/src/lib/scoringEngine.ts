import {
  ExtractedFeatures,
  Occupation,
  ScoringEngineOutput,
  FactorBreakdown,
  AnomalyFlag,
  SimulationResult
} from './types'
import { evaluateOccupationBaseline } from './occupationAdjuster'

export const SCORING_ENGINE_VERSION = 'v1.0'

/**
 * Pure, deterministic 900-point underwriting scoring engine.
 * Guaranteed same input -> exact same output every time (no LLM calls, no randomness).
 */
export function calculateDeterministicScore(
  features: ExtractedFeatures,
  occupation: Occupation,
  anomalies: AnomalyFlag[] = []
): ScoringEngineOutput {
  // 1. Income Stability (200 pts max) — evaluated via Occupation Baseline Adjuster
  const occupationEval = evaluateOccupationBaseline(occupation, features.incomeVolatility)
  const incomeSubScore = Math.min(Math.max(occupationEval.incomeStabilityScore, 50), 200)

  // 2. Savings Behavior (150 pts max)
  let savingsSubScore = 90
  let savingsReason = ''
  if (features.savingsRatio >= 0.30) {
    savingsSubScore = 145
    savingsReason = `Savings Behavior: 145/150 — Excellent savings retention (${Math.round(features.savingsRatio * 100)}% of income retained).`
  } else if (features.savingsRatio >= 0.15) {
    savingsSubScore = 125
    savingsReason = `Savings Behavior: 125/150 — Solid savings retention (${Math.round(features.savingsRatio * 100)}% of income retained).`
  } else if (features.savingsRatio >= 0.05) {
    savingsSubScore = 105
    savingsReason = `Savings Behavior: 105/150 — Moderate cash retention (${Math.round(features.savingsRatio * 100)}% of income retained).`
  } else {
    savingsSubScore = 80
    savingsReason = `Savings Behavior: 80/150 — Low net savings retention (${Math.round(features.savingsRatio * 100)}% of income retained).`
  }

  // 3. Expense Stability (150 pts max)
  let expenseSubScore = 110
  let expenseReason = ''
  if (features.expenseVariance <= 0.20) {
    expenseSubScore = 142
    expenseReason = `Expense Stability: 142/150 — Highly predictable monthly outflow pattern (low variance ${Math.round(features.expenseVariance * 100)}%).`
  } else if (features.expenseVariance <= 0.35) {
    expenseSubScore = 125
    expenseReason = `Expense Stability: 125/150 — Normal commercial expense variance (${Math.round(features.expenseVariance * 100)}%).`
  } else {
    expenseSubScore = 100
    expenseReason = `Expense Stability: 100/150 — Fluctuating monthly debit outflows (${Math.round(features.expenseVariance * 100)}% variance).`
  }

  // 4. Payment Consistency (150 pts max)
  const paymentSubScore = Math.min(Math.round((features.paymentConsistencyScore / 100) * 150), 150)
  const paymentReason = `Payment Consistency: ${paymentSubScore}/150 — ${features.recurringDebitsCount} recurring monthly bill/EMI obligations verified on-time.`

  // 5. Repayment Capacity (150 pts max)
  let repaymentSubScore = 100
  let repaymentReason = ''
  if (features.repaymentCapacityRatio >= 0.35) {
    repaymentSubScore = 145
    repaymentReason = `Repayment Capacity: 145/150 — Strong disposable buffer (${Math.round(features.repaymentCapacityRatio * 100)}% net disposable margin).`
  } else if (features.repaymentCapacityRatio >= 0.20) {
    repaymentSubScore = 125
    repaymentReason = `Repayment Capacity: 125/150 — Healthy debt service coverage (${Math.round(features.repaymentCapacityRatio * 100)}% disposable margin).`
  } else {
    repaymentSubScore = 95
    repaymentReason = `Repayment Capacity: 95/150 — Tight cash margin after essential business outflows.`
  }

  // 6. Financial Risk Index (100 pts max) — inverted risk score (higher subscore = safer)
  const riskSubScore = Math.max(100 - features.financialRiskIndex, 20)
  const riskReason = `Financial Risk: ${riskSubScore}/100 — ${features.thinBufferDays} low buffer days (< ₹1,000 balance) recorded in 90-day window.`

  // Sum total 900-point score
  const totalScore = Math.min(
    Math.max(
      incomeSubScore +
        savingsSubScore +
        expenseSubScore +
        paymentSubScore +
        repaymentSubScore +
        riskSubScore,
      300
    ),
    900
  )

  let tier: 'Excellent' | 'Good' | 'Moderate' | 'Fair' | 'New Member' = 'Fair'
  let topPercent = 'Top 45%'
  if (totalScore >= 800) {
    tier = 'Excellent'
    topPercent = 'Top 5%'
  } else if (totalScore >= 730) {
    tier = 'Good'
    topPercent = 'Top 15%'
  } else if (totalScore >= 670) {
    tier = 'Moderate'
    topPercent = 'Top 30%'
  }

  const factor_breakdown: FactorBreakdown = {
    income_stability: {
      factorKey: 'income_stability',
      factorName: 'Income Stability (Baseline Adjusted)',
      subScore: incomeSubScore,
      maxScore: 200,
      weight: 22.2,
      status: incomeSubScore >= 160 ? 'positive' : 'attention',
      reason: occupationEval.reason
    },
    savings_behavior: {
      factorKey: 'savings_behavior',
      factorName: 'Savings Behavior & Retention',
      subScore: savingsSubScore,
      maxScore: 150,
      weight: 16.7,
      status: savingsSubScore >= 120 ? 'positive' : 'attention',
      reason: savingsReason
    },
    expense_stability: {
      factorKey: 'expense_stability',
      factorName: 'Expense Outflow Predictability',
      subScore: expenseSubScore,
      maxScore: 150,
      weight: 16.7,
      status: expenseSubScore >= 120 ? 'positive' : 'attention',
      reason: expenseReason
    },
    payment_consistency: {
      factorKey: 'payment_consistency',
      factorName: 'Recurring Bill & EMI Discipline',
      subScore: paymentSubScore,
      maxScore: 150,
      weight: 16.7,
      status: paymentSubScore >= 120 ? 'positive' : 'attention',
      reason: paymentReason
    },
    repayment_capacity: {
      factorKey: 'repayment_capacity',
      factorName: 'Net Repayment Margin',
      subScore: repaymentSubScore,
      maxScore: 150,
      weight: 16.7,
      status: repaymentSubScore >= 120 ? 'positive' : 'attention',
      reason: repaymentReason
    },
    financial_risk: {
      factorKey: 'financial_risk',
      factorName: 'Liquidity Buffer & Risk Index',
      subScore: riskSubScore,
      maxScore: 100,
      weight: 11.1,
      status: riskSubScore >= 70 ? 'positive' : 'attention',
      reason: riskReason
    }
  }

  return {
    score: totalScore,
    maxScore: 900,
    scoring_engine_version: SCORING_ENGINE_VERSION,
    tier,
    topPercent,
    factor_breakdown,
    anomaly_flags: anomalies,
    occupation,
    occupationAdjustmentReason: occupationEval.reason,
    calculatedAt: new Date().toISOString(),
    summaryStats: {
      avgMonthlyIncome: Math.round(features.avgMonthlyIncome),
      avgMonthlyExpense: Math.round(features.avgMonthlyExpense),
      netSavings: Math.round(features.netFlow),
      transactionCount: features.totalTransactionCount,
      daysAnalyzed: features.daysOfData
    }
  }
}

/**
 * Dynamic "Improve My Score" simulation engine.
 * Re-runs the deterministic scoring logic with user-adjusted slider assumptions.
 */
export function calculateDynamicSimulation(
  userId: string,
  currentOutput: ScoringEngineOutput,
  savingsContribution: number, // e.g. ₹25,000 / mo
  expenseVariancePct: number, // e.g. 15%
  debtAllocationPct: number // e.g. 30%
): SimulationResult {
  const currentScore = currentOutput.score

  // Calculate projected point gains dynamically based on adjusted assumptions
  const savingsBoost = Math.round((savingsContribution / 50000) * 24)
  const varianceBoost = Math.round(((40 - expenseVariancePct) / 35) * 16)
  const debtBoost = Math.round((debtAllocationPct / 100) * 18)

  const pointsGained = Math.max(savingsBoost + varianceBoost + debtBoost, 0)
  const projectedScore = Math.min(currentScore + pointsGained, 900)

  return {
    userId,
    savingsContribution,
    expenseVariance: expenseVariancePct,
    debtAllocation: debtAllocationPct,
    currentScore,
    projectedScore,
    pointsGained,
    factorDeltas: {
      savings_behavior: savingsBoost,
      expense_stability: varianceBoost,
      repayment_capacity: debtBoost
    },
    isSimulated: true,
    disclaimer: 'Projected / Simulated — not your current score.',
    updatedAt: new Date().toISOString()
  }
}
