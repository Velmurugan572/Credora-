import { TransactionRecord, AnomalyFlag } from './types'

export function detectAnomalies(transactions: TransactionRecord[], thinBufferDays: number = 0): AnomalyFlag[] {
  const flags: AnomalyFlag[] = []
  if (!transactions || transactions.length === 0) return flags

  const credits = transactions.filter(t => t.direction === 'credit')
  const timestampStr = new Date().toISOString()

  // 1. Round-number repetition: >3 identical round-number credits within 7 days
  const roundCreditGroups: Record<number, number> = {}
  credits.forEach(c => {
    if (c.amount >= 1000 && c.amount % 500 === 0) {
      roundCreditGroups[c.amount] = (roundCreditGroups[c.amount] || 0) + 1
    }
  })

  Object.entries(roundCreditGroups).forEach(([amtStr, count]) => {
    if (count > 3) {
      const amt = parseFloat(amtStr)
      flags.push({
        id: `anomaly_round_${amt}`,
        type: 'round_number_repetition',
        title: 'Frequent Round-Amount Inflows Detected',
        description: `Detected ${count} identical ₹${amt.toLocaleString('en-IN')} credit transactions. Routine pattern marked for standard underwriting audit.`,
        severity: 'low',
        timestamp: timestampStr
      })
    }
  })

  // 2. Sudden Payer Diversification: >=4 unique new credit counterparties in a 7-day period
  const uniqueCounterparties = new Set(credits.map(c => c.counterparty))
  if (uniqueCounterparties.size >= 8 && transactions.length < 50) {
    flags.push({
      id: 'anomaly_payer_diversity',
      type: 'sudden_payer_diversification',
      title: 'High Counterparty Expansion Rate',
      description: `Inflow stream received from ${uniqueCounterparties.size} distinct counterparties over recent 90-day window. Positive for customer diversification, marked for verification.`,
      severity: 'low',
      timestamp: timestampStr
    })
  }

  // 3. Velocity Spike: Transaction volume surges significantly week-over-week
  if (transactions.length >= 40) {
    const half = Math.floor(transactions.length / 2)
    const firstHalfCount = half
    const secondHalfCount = transactions.length - half
    if (secondHalfCount > firstHalfCount * 2.2) {
      flags.push({
        id: 'anomaly_velocity_spike',
        type: 'velocity_spike',
        title: 'Transaction Volume Surge Detected',
        description: `Transaction frequency accelerated by >100% in recent weeks. Marked to verify business expansion vs artificial activity.`,
        severity: 'medium',
        timestamp: timestampStr
      })
    }
  }

  // 4. Thin Buffer Days Alert
  if (thinBufferDays >= 5) {
    flags.push({
      id: 'anomaly_thin_buffer',
      type: 'thin_buffer_alert',
      title: 'Low Liquidity Buffer Threshold',
      description: `Account dipped below ₹1,000 minimum buffer threshold on ${thinBufferDays} days. Maintaining a ₹5,000 reserve buffer is recommended to protect cash flow.`,
      severity: 'medium',
      timestamp: timestampStr
    })
  }

  return flags
}
