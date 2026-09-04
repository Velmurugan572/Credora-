'use client'

import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Upload,
  Info
} from 'lucide-react'

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'positive' | 'attention'>('all')
  const [telemetry, setTelemetry] = useState<any>(null)
  const [hasData, setHasData] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchInsights = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/insights', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && data.hasData && data.telemetry) {
        setHasData(true)
        setTelemetry(data.telemetry)
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
    fetchInsights()
  }, [])

  const score = telemetry?.score || 0
  const tier = telemetry?.tier || 'New Member'
  const occupation = telemetry?.occupation || 'Kirana Shop'
  const factors = telemetry?.factor_breakdown

  const factorList = factors ? Object.values(factors) : []
  const filteredFactors = factorList.filter((f: any) => {
    if (activeTab === 'positive') return f.status === 'positive'
    if (activeTab === 'attention') return f.status === 'attention'
    return true
  })

  return (
    <DashboardLayout
      title="Score Insights & Factor Analysis"
      subtitle="Transparent breakdown of cash flow financial behaviors shaping your Credora score"
    >
      <div className="space-y-8">
        {!hasData && !isLoading && (
          <div className="bg-gradient-to-r from-credora-navy via-slate-900 to-credora-navy text-white p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-credora-mint-light px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Onboarding Required</span>
              </div>
              <h3 className="text-2xl font-black text-white">No Factor Telemetry Available</h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-medium">
                Upload your 90-day transaction CSV or link your bank account to calculate your factor-level Credora Score breakdown.
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
            {/* Top Score Summary Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-credora-card flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                <div className="w-20 h-20 rounded-2xl bg-credora-navy text-white flex flex-col items-center justify-center font-black text-3xl shadow-md flex-shrink-0 border border-slate-800">
                  <span>{score}</span>
                  <span className="text-[10px] text-credora-mint-light font-extrabold uppercase tracking-wider">{tier}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-credora-navy">Cash Flow Health Breakdown</h3>
                  <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed font-medium">
                    Evaluated for <strong>{occupation}</strong> trade baseline using deterministic 900-point underwriting rules (v1.0).
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 text-xs font-bold w-full md:w-auto">
                <div className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-center">
                  <span className="block text-xl font-black text-credora-emerald">
                    {factorList.filter((f: any) => f.status === 'positive').length} Factors
                  </span>
                  <span className="text-[11px]">Strong Drivers</span>
                </div>
                <div className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/70 text-center">
                  <span className="block text-xl font-black text-amber-700">
                    {factorList.filter((f: any) => f.status === 'attention').length} Factors
                  </span>
                  <span className="text-[11px]">Opportunity Areas</span>
                </div>
              </div>
            </div>

            {/* Interactive Filter Tabs */}
            <div className="flex border-b border-slate-200 space-x-6 text-xs sm:text-sm font-bold text-slate-500">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 transition relative ${
                  activeTab === 'all'
                    ? 'text-credora-navy border-b-2 border-credora-emerald font-extrabold'
                    : 'hover:text-credora-navy'
                }`}
              >
                All Factors ({factorList.length})
              </button>
              <button
                onClick={() => setActiveTab('positive')}
                className={`pb-3 transition relative ${
                  activeTab === 'positive'
                    ? 'text-credora-navy border-b-2 border-credora-emerald font-extrabold'
                    : 'hover:text-credora-navy'
                }`}
              >
                Strong Factors
              </button>
              <button
                onClick={() => setActiveTab('attention')}
                className={`pb-3 transition relative ${
                  activeTab === 'attention'
                    ? 'text-credora-navy border-b-2 border-credora-emerald font-extrabold'
                    : 'hover:text-credora-navy'
                }`}
              >
                Needs Attention
              </button>
            </div>

            {/* Factor Cards List */}
            <div className="space-y-4">
              {filteredFactors.map((factor: any) => {
                const isPositive = factor.status === 'positive'
                const pct = Math.round((factor.subScore / factor.maxScore) * 100)

                return (
                  <div
                    key={factor.factorKey}
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-credora-sm hover:shadow-md transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center space-x-3">
                        {isPositive ? (
                          <div className="p-2.5 rounded-2xl bg-emerald-50 text-credora-emerald border border-emerald-200">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-base font-extrabold text-credora-navy">{factor.factorName}</h4>
                          <span className="text-xs text-slate-400 font-medium">Weight: {factor.weight}% of total score</span>
                        </div>
                      </div>

                      <div className="flex items-baseline space-x-1 self-end sm:self-auto">
                        <span className="text-2xl font-black text-credora-navy">{factor.subScore}</span>
                        <span className="text-xs text-slate-400 font-bold">/ {factor.maxScore} pts</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isPositive ? 'bg-credora-emerald' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>

                    {/* Audit Reason String */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed font-medium flex items-start space-x-2">
                      <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{factor.reason}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Trust & Safety Notice */}
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-slate-600 text-xs leading-relaxed">
          <p className="font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-credora-emerald" />
            <span>Auditability & Rule Transparency</span>
          </p>
          <p>
            • All factor sub-scores are calculated by a deterministic rules engine (v1.0).
            <br />
            • The AI Advisor explains these factors but does not compute or modify them.
            <br />• Occupation baseline adjustments protect MSME daily income volatility from unfair penalties.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
