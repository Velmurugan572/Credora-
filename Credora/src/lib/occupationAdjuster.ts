import { Occupation, OccupationBaseline } from './types'

export const OCCUPATION_BASELINES: Record<Occupation, OccupationBaseline> = {
  'Fruit/Vegetable Vendor': {
    occupation: 'Fruit/Vegetable Vendor',
    minExpectedVolatility: 0.25,
    maxExpectedVolatility: 0.40,
    description: 'High daily cash fluctuation due to perishable inventory & market day surges.'
  },
  'Auto/Taxi Driver': {
    occupation: 'Auto/Taxi Driver',
    minExpectedVolatility: 0.30,
    maxExpectedVolatility: 0.45,
    description: 'Variable daily fare payouts influenced by weekend traffic and surge pricing.'
  },
  'Kirana Shop': {
    occupation: 'Kirana Shop',
    minExpectedVolatility: 0.15,
    maxExpectedVolatility: 0.25,
    description: 'Steady daily household provisions cash flow with monthly credit settlement cycles.'
  },
  'Street Food Vendor': {
    occupation: 'Street Food Vendor',
    minExpectedVolatility: 0.25,
    maxExpectedVolatility: 0.35,
    description: 'High evening cash/UPI velocity with weekend demand spikes.'
  },
  'Tailor': {
    occupation: 'Tailor',
    minExpectedVolatility: 0.15,
    maxExpectedVolatility: 0.30,
    description: 'Moderate seasonal variation around festival & wedding periods.'
  },
  'E-commerce Delivery': {
    occupation: 'E-commerce Delivery',
    minExpectedVolatility: 0.20,
    maxExpectedVolatility: 0.35,
    description: 'Weekly order volume payouts with sales event spikes.'
  },
  'Salon Owner': {
    occupation: 'Salon Owner',
    minExpectedVolatility: 0.15,
    maxExpectedVolatility: 0.25,
    description: 'Consistent weekend customer traffic and recurring local appointments.'
  },
  'Micro-Manufacturer / Artisan': {
    occupation: 'Micro-Manufacturer / Artisan',
    minExpectedVolatility: 0.20,
    maxExpectedVolatility: 0.35,
    description: 'Batch order payments with periodic material purchase cycles.'
  },
  'General Micro-Merchant': {
    occupation: 'General Micro-Merchant',
    minExpectedVolatility: 0.20,
    maxExpectedVolatility: 0.30,
    description: 'Standard retail trade baseline cash-flow profile.'
  }
}

export interface AdjustedIncomeScore {
  incomeStabilityScore: number // 0 - 200 pts
  rawVolatilityPercent: number
  baselineMinPercent: number
  baselineMaxPercent: number
  penaltyApplied: number
  bonusApplied: number
  reason: string
}

export function evaluateOccupationBaseline(
  occupation: Occupation,
  rawVolatility: number
): AdjustedIncomeScore {
  const baseline = OCCUPATION_BASELINES[occupation] || OCCUPATION_BASELINES['General Micro-Merchant']

  const rawVolPct = Math.round(rawVolatility * 100)
  const minPct = Math.round(baseline.minExpectedVolatility * 100)
  const maxPct = Math.round(baseline.maxExpectedVolatility * 100)

  let basePoints = 175 // Default healthy baseline
  let penaltyApplied = 0
  let bonusApplied = 0
  let reason = ''

  if (rawVolatility <= baseline.maxExpectedVolatility && rawVolatility >= baseline.minExpectedVolatility) {
    // Inside expected trade band -> No penalty!
    penaltyApplied = 0
    bonusApplied = 10
    basePoints = 185
    reason = `Income Volatility: 185/200 — Raw volatility ${rawVolPct}% is within trade baseline band (${minPct}–${maxPct}%) for ${occupation}. No penalty applied.`
  } else if (rawVolatility < baseline.minExpectedVolatility) {
    // Unusually stable for this trade -> Bonus awarded!
    bonusApplied = 20
    basePoints = 195
    reason = `Income Volatility: 195/200 — Raw volatility ${rawVolPct}% is exceptionally stable below trade baseline (${minPct}–${maxPct}%) for ${occupation}. Bonus awarded.`
  } else {
    // Volatility exceeds upper trade threshold -> Proportional penalty
    const excess = rawVolatility - baseline.maxExpectedVolatility
    penaltyApplied = Math.min(Math.round(excess * 150), 60)
    basePoints = Math.max(175 - penaltyApplied, 110)
    reason = `Income Volatility: ${basePoints}/200 — Raw volatility ${rawVolPct}% exceeds trade baseline upper limit (${maxPct}%) for ${occupation}. Deducted ${penaltyApplied} pts.`
  }

  return {
    incomeStabilityScore: basePoints,
    rawVolatilityPercent: rawVolPct,
    baselineMinPercent: minPct,
    baselineMaxPercent: maxPct,
    penaltyApplied,
    bonusApplied,
    reason
  }
}
