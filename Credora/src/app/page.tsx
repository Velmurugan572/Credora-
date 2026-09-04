'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/context/AuthContext'
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  CreditCard,
  Building2,
  Smartphone,
  ChevronRight
} from 'lucide-react'

export default function LandingPage() {
  const { openAuthModal } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/60">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-credora-mint/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 text-credora-emerald px-4 py-2 rounded-full w-max mx-auto lg:mx-0 text-xs font-bold border border-emerald-200/60 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-credora-mint animate-pulse"></span>
                <span>Now Available for Early Access in India 🇮🇳</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-credora-navy tracking-tight leading-[1.15]">
                Making{' '}
                <span className="bg-gradient-to-r from-credora-emerald via-emerald-600 to-credora-mint bg-clip-text text-transparent">
                  Invisible Creditworthiness
                </span>{' '}
                Visible.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Millions of freelancers, gig workers, and daily cash-income MSMEs are excluded from traditional loans not because they are high risk, but because legacy credit bureaus can't evaluate cash flow. Credora changes the lens.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-2xl font-bold text-sm bg-credora-emerald text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-800 transition transform hover:-translate-y-0.5"
                >
                  <span>Get Your Credora Score</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>

                <Link
                  href="/simulator"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-2xl font-bold text-sm border border-slate-300 bg-white text-credora-navy hover:bg-slate-50 transition shadow-xs"
                >
                  Try Credit Simulator
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-6 pt-4 text-xs text-slate-500 font-semibold">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-credora-emerald" />
                  <span>RBI AA Encrypted Sync</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-credora-emerald" />
                  <span>Score Ready in 60s</span>
                </div>
              </div>
            </div>

            {/* Right Hero Card / Visual */}
            <div className="lg:col-span-5 relative">
              <Link href="/dashboard" className="block group">
                <div className="relative w-full aspect-square max-w-md mx-auto rounded-3xl bg-credora-navy border border-slate-800 shadow-2xl p-8 flex flex-col items-center justify-between overflow-hidden transition-transform group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none"></div>

                  <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4 z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-credora-mint/20 text-credora-mint flex items-center justify-center text-xs font-bold">
                        C
                      </div>
                      <span className="text-xs font-bold text-slate-300">Live Cash Flow Telemetry</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      AA Sync
                    </span>
                  </div>

                  {/* Score Dial Badge */}
                  <div className="relative z-10 w-56 h-56 rounded-full bg-slate-900 border-4 border-slate-800 shadow-2xl flex flex-col items-center justify-center p-6 text-white text-center group-hover:border-emerald-500/40 transition-colors">
                    <div className="absolute inset-0 rounded-full border-4 border-credora-mint/30 animate-pulse"></div>
                    <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                      Credora Score
                    </span>
                    <span className="text-6xl font-black text-white tracking-tight">785</span>
                    <div className="mt-2 inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/20 text-credora-mint-light text-xs font-bold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+15 pts this month</span>
                    </div>
                  </div>

                  {/* Floating Metric Cards */}
                  <div className="grid grid-cols-2 gap-3 w-full z-10">
                    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-2xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Income Stability</p>
                      <p className="text-sm font-extrabold text-white mt-0.5">94 / 100</p>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-2xl text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cash Flow Ratio</p>
                      <p className="text-sm font-extrabold text-credora-mint-light mt-0.5">1.42x</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Problem Statement Section ("The Bureau Gap") */}
        <section className="bg-white py-20 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <span className="text-credora-emerald font-extrabold text-xs tracking-widest uppercase block">
              The Bureau Gap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-credora-navy">
              Reliable people shouldn't be invisible.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
              You pay rent on time. You budget carefully. You save consistently via SIPs & UPI. Yet traditional CIBIL formulas categorize gig workers and freelancers as "thin-file" or "unscorable."
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-left">
              <Link href="/insights" className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h3 className="font-bold text-sm text-credora-navy">Ignored Cash Flow</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Traditional credit scoring ignores bank balances, rent receipts, and UPI freelance payouts.
                </p>
              </Link>

              <Link href="/simulator" className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h3 className="font-bold text-sm text-credora-navy">Debt Requirement</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  To build credit, legacy systems force you to take on debt first. We reward positive money habits first.
                </p>
              </Link>

              <Link href="/connections" className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-credora-emerald flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h3 className="font-bold text-sm text-credora-navy">Credora Solution</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We analyze real cash flow telemetry in seconds via RBI Account Aggregators to unlock fair credit ratings.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Card Visual */}
            <Link href="/insights" className="lg:col-span-6 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6 hover:shadow-2xl transition block">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-credora-emerald flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-credora-navy">Behavioral Cash Flow Scoring</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Credora hooks directly into your primary checking, savings, and UPI payout hubs via bank-level Account Aggregator integration. We evaluate real-time financial health without hard CIBIL inquiries.
              </p>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs font-bold text-credora-navy">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-credora-emerald" />
                  <span>50+ Indian Banks Supported</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-credora-emerald" />
                  <span>24 Months History Sync</span>
                </div>
              </div>
            </Link>

            {/* Right Pillars List */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-credora-emerald font-extrabold text-xs tracking-widest uppercase block">
                The Solution
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-credora-navy">
                A fairer way to prove your financial worth.
              </h2>
              <p className="text-base text-slate-600 font-medium">
                We replace outdated debt formulas with modern financial pillars that reward positive money habits:
              </p>

              <ul className="space-y-4 text-sm text-slate-800 font-semibold">
                <li className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-credora-emerald flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-credora-navy">Income Stability:</strong> Verified recurring salary and UPI gig payouts over 12+ months.
                  </span>
                </li>
                <li className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-credora-emerald flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-credora-navy">Savings Velocity:</strong> Consistent emergency buffer & SIP accumulation over time.
                  </span>
                </li>
                <li className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-credora-emerald flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-credora-navy">Bill Discipline:</strong> Timely rent, utilities, and subscription executions.
                  </span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/simulator"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-credora-navy text-white font-bold text-xs hover:bg-slate-800 transition shadow-md"
                >
                  <span>Simulate Your Score Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Dark Footer */}
      <footer className="bg-credora-navy text-white border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-credora-mint text-credora-navy flex items-center justify-center font-black">
              C
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">Credora</span>
            <span>© 2026 Credora Financial India Private Limited. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap gap-6 font-semibold">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/simulator" className="hover:text-white transition">Credit Fitness</Link>
            <Link href="/insights" className="hover:text-white transition">Score Insights</Link>
            <Link href="/connections" className="hover:text-white transition">Bank Links & Security</Link>
          </div>
        </div>
      </footer>

      {/* Auth Modal Trigger Container */}
      <AuthModal />
    </div>
  )
}
