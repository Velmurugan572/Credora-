'use client'

import DashboardLayout from '@/components/DashboardLayout'
import ActionStrategyModal from '@/components/ActionStrategyModal'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Sliders,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  ShieldCheck,
  Zap,
  Upload
} from 'lucide-react'

export default function SimulatorPage() {
  const [hasData, setHasData] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [savingsContribution, setSavingsContribution] = useState<number>(25000)
  const [expenseVariance, setExpenseVariance] = useState<number>(15)
  const [debtAllocation, setDebtAllocation] = useState<number>(30)
  const [currentScore, setCurrentScore] = useState<number>(720)
  const [projectedScore, setProjectedScore] = useState<number>(743)
  const [pointsGained, setPointsGained] = useState<number>(23)

  const [selectedStrategy, setSelectedStrategy] = useState<{
    title: string
    category: string
    description: string
    impact: string
    steps: string[]
  } | null>(null)

  const fetchSimulation = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/simulator', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && data.hasData && data.simulation) {
        setHasData(true)
        setSavingsContribution(data.simulation.savingsContribution)
        setExpenseVariance(data.simulation.expenseVariance)
        setDebtAllocation(data.simulation.debtAllocation)
        setCurrentScore(data.simulation.currentScore)
        setProjectedScore(data.simulation.projectedScore)
        setPointsGained(data.simulation.pointsGained)
      } else {
        setHasData(false)
      }
    } catch (err) {
      console.error(err)
      setHasData(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSimulation()
  }, [])

  const updateSimulation = async (s: number, v: number, d: number) => {
    setSavingsContribution(s)
    setExpenseVariance(v)
    setDebtAllocation(d)

    try {
      const res = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savingsContribution: s, expenseVariance: v, debtAllocation: d })
      })
      const data = await res.json()
      if (data.success && data.simulation) {
        setCurrentScore(data.simulation.currentScore)
        setProjectedScore(data.simulation.projectedScore)
        setPointsGained(data.simulation.pointsGained)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenGroceryStrategy = () => {
    setSelectedStrategy({
      title: 'Stabilize Monthly Grocery & Stock Outflow',
      category: 'Expense Stability',
      description: 'Cap monthly variance to smooth out cash flow spikes.',
      impact: '+6 Points',
      steps: [
        'Set up a dedicated UPI spending limit or sub-account for grocery purchases with a ₹15,000/mo cap.',
        'Review weekly UPI & card receipts to eliminate unexpected variance.',
        'Maintain consistent bi-weekly purchasing schedules to optimize cash-flow telemetry.'
      ]
    })
  }

  const handleOpenSavingsStrategy = () => {
    setSelectedStrategy({
      title: 'Automate Weekly Savings Transfer',
      category: 'Savings Velocity',
      description: 'Build emergency liquid buffer automatically without manual transfers.',
      impact: '+14 Points',
      steps: [
        'Schedule a recurring ₹2,500 weekly auto-debit from Checking to Savings.',
        'Ensure direct deposit settles prior to automated transfer date.',
        'Maintain minimum ₹50,000 liquid threshold for 60 consecutive days.'
      ]
    })
  }

  return (
    <DashboardLayout
      title="Credit Fitness Simulator"
      subtitle="Dynamic scoring scenario modeling — test how cash-flow habits impact your projected score"
    >
      <div className="space-y-8">
        {!hasData && !isLoading && (
          <div className="bg-gradient-to-r from-credora-navy via-slate-900 to-credora-navy text-white p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-credora-mint-light px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Onboarding Required</span>
              </div>
              <h3 className="text-2xl font-black text-white">No Active Cash Flow Telemetry</h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-medium">
                Please upload your 90-day transaction CSV or link a bank account on the Overview page to enable the Credit Fitness Simulator.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-credora-emerald hover:bg-emerald-800 text-white font-bold text-xs shadow-lg transition flex items-center space-x-2 flex-shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Go to Overview & Upload Data</span>
            </Link>
          </div>
        )}

        {hasData && (
          <>
            {/* Disclaimer Badge */}
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
              <span className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-credora-emerald" />
                <span>Projected / Simulated — not your current score. All scenarios are calculated via pure deterministic rules.</span>
              </span>
              <span className="bg-credora-emerald text-white px-2.5 py-1 rounded-lg text-[10px] uppercase font-black">
                Dynamic Engine v1.0
              </span>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Sliders Card */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-credora-card space-y-8">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-credora-navy">Cash Flow Assumptions</h3>
                    <p className="text-xs text-slate-500 font-medium">Adjust monthly habits to model point changes</p>
                  </div>
                  <button
                    onClick={() => updateSimulation(25000, 15, 30)}
                    className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-credora-navy transition bg-slate-100 px-3 py-1.5 rounded-xl"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Slider 1: Monthly Savings */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700">Monthly Savings Contribution</span>
                    <span className="text-credora-emerald font-black text-sm">
                      +₹{savingsContribution.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="5000"
                    value={savingsContribution}
                    onChange={(e) => updateSimulation(Number(e.target.value), expenseVariance, debtAllocation)}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-credora-emerald"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>₹0</span>
                    <span>₹25,000</span>
                    <span>₹50,000+</span>
                  </div>
                </div>

                {/* Slider 2: Expense Volatility */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700">Expense Outflow Stability (Variance)</span>
                    <span className="text-credora-navy font-black text-sm">{expenseVariance}% Variance</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={expenseVariance}
                    onChange={(e) => updateSimulation(savingsContribution, Number(e.target.value), debtAllocation)}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-credora-navy"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Stable (5%)</span>
                    <span>Moderate (25%)</span>
                    <span>Volatile (50%)</span>
                  </div>
                </div>

                {/* Slider 3: Income Growth Allocation to Debt */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700">Income Growth to Debt Repayment Allocation</span>
                    <span className="text-blue-600 font-black text-sm">{debtAllocation}% Allocated</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={debtAllocation}
                    onChange={(e) => updateSimulation(savingsContribution, expenseVariance, Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Right Output Score Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-credora-navy text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-credora-emerald/20 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-credora-mint-light">
                      Projected Outcome
                    </span>
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/20 text-credora-mint-light text-xs font-bold border border-emerald-500/30">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{pointsGained} pts projected</span>
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-3">
                    <span className="text-6xl font-black tracking-tight text-white">{projectedScore}</span>
                    <span className="text-slate-400 font-bold text-lg">/ 900</span>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Current Score</span>
                      <span className="text-white font-bold">{currentScore}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Simulated Gain</span>
                      <span className="text-credora-mint-light font-bold">+{pointsGained} Points</span>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenSavingsStrategy}
                    className="w-full py-3.5 rounded-2xl bg-credora-emerald hover:bg-emerald-800 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2"
                  >
                    <span>View Action Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Strategy Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Strategies</h4>
                  <div
                    onClick={handleOpenGroceryStrategy}
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-credora-navy group-hover:text-credora-emerald transition">
                          Stabilize Monthly Outflow
                        </h5>
                        <p className="text-[10px] text-slate-500">Expense Stability • +6 Points</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-credora-emerald transition" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Trust & Safety Notice */}
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-slate-600 text-xs leading-relaxed">
          <p className="font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-credora-emerald" />
            <span>Simulation Disclaimer</span>
          </p>
          <p>
            • Simulation outputs are projections calculated by Credora's deterministic rules engine.
            <br />
            • Simulations do not modify your actual stored score or credit profile.
            <br />• Final credit approval remains subject to lender underwriting criteria.
          </p>
        </div>
      </div>

      <ActionStrategyModal
        isOpen={!!selectedStrategy}
        onClose={() => setSelectedStrategy(null)}
        strategy={selectedStrategy}
      />
    </DashboardLayout>
  )
}

function ChevronRight(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  )
}
