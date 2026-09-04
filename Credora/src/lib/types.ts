export type Occupation =
  | 'Fruit/Vegetable Vendor'
  | 'Auto/Taxi Driver'
  | 'Kirana Shop'
  | 'Street Food Vendor'
  | 'Tailor'
  | 'E-commerce Delivery'
  | 'Salon Owner'
  | 'Micro-Manufacturer / Artisan'
  | 'General Micro-Merchant'

export type Language = 'en' | 'hi' | 'ta' | 'mr'

export interface TransactionRecord {
  date: string // YYYY-MM-DD
  amount: number // positive for credit, negative for debit
  direction: 'credit' | 'debit'
  counterparty: string
  description: string
  runningBalance?: number
}

export interface ExtractedFeatures {
  totalCredits: number
  totalDebits: number
  netFlow: number
  avgMonthlyIncome: number
  avgMonthlyExpense: number
  incomeVolatility: number // Coefficient of Variation (0 - 1+)
  savingsRatio: number // Ratio of net retained vs credits (0 - 1)
  expenseVariance: number // Coefficient of Variation of debits (0 - 1+)
  paymentConsistencyScore: number // 0 - 100
  repaymentCapacityRatio: number // Disposable income ratio (0 - 1)
  financialRiskIndex: number // 0 - 100 (higher = riskier)
  thinBufferDays: number // Days balance < ₹1,000
  recurringDebitsCount: number
  totalTransactionCount: number
  daysOfData: number
}

export interface OccupationBaseline {
  occupation: Occupation
  minExpectedVolatility: number // e.g. 0.25 (25%)
  maxExpectedVolatility: number // e.g. 0.40 (40%)
  description: string
}

export interface FactorBreakdownItem {
  factorKey: 'income_stability' | 'savings_behavior' | 'expense_stability' | 'payment_consistency' | 'repayment_capacity' | 'financial_risk'
  factorName: string
  subScore: number // Score achieved out of maxScore
  maxScore: number // Maximum points allocated to this factor
  weight: number // Percentage weight of total score
  status: 'positive' | 'attention' | 'neutral'
  reason: string // Detailed audit explanation
}

export interface FactorBreakdown {
  income_stability: FactorBreakdownItem
  savings_behavior: FactorBreakdownItem
  expense_stability: FactorBreakdownItem
  payment_consistency: FactorBreakdownItem
  repayment_capacity: FactorBreakdownItem
  financial_risk: FactorBreakdownItem
}

export interface AnomalyFlag {
  id: string
  type: 'round_number_repetition' | 'sudden_payer_diversification' | 'velocity_spike' | 'thin_buffer_alert'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  timestamp: string
}

export interface ScoringEngineOutput {
  score: number // 300 - 900
  maxScore: 900
  scoring_engine_version: string // e.g. "v1.0"
  tier: 'Excellent' | 'Good' | 'Moderate' | 'Fair' | 'New Member'
  topPercent: string
  factor_breakdown: FactorBreakdown
  anomaly_flags: AnomalyFlag[]
  occupation: Occupation
  occupationAdjustmentReason: string
  calculatedAt: string
  summaryStats: {
    avgMonthlyIncome: number
    avgMonthlyExpense: number
    netSavings: number
    transactionCount: number
    daysAnalyzed: number
  }
}

export interface SimulationResult {
  userId: string
  savingsContribution: number
  expenseVariance: number
  debtAllocation: number
  currentScore: number
  projectedScore: number
  pointsGained: number
  factorDeltas: Record<string, number>
  isSimulated: true
  disclaimer: string
  updatedAt: string
}
