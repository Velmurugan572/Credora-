'use client'

import DashboardLayout from '@/components/DashboardLayout'
import PlaidModal from '@/components/PlaidModal'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { parseTransactionCSV } from '@/lib/csvParser'
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Wallet,
  Calendar,
  Layers,
  ShoppingBag,
  Clock,
  ChevronRight,
  Plus,
  ShieldCheck,
  Upload,
  FileText,
  Briefcase,
  AlertCircle
} from 'lucide-react'
import { Occupation } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaidOpen, setIsPlaidOpen] = useState(false)
  const [selectedOccupation, setSelectedOccupation] = useState<Occupation>('Kirana Shop')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadWarning, setUploadWarning] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/dashboard', { cache: 'no-store' })
      const json = await res.json()
      if (json.success) {
        setData(json)
        if (json.user?.occupation) {
          setSelectedOccupation(json.user.occupation)
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const processCSVFile = async (file: File) => {
    if (!file) return
    setUploadError(null)
    setUploadWarning(null)
    setUploadSuccess(null)

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Invalid file type: Please upload a valid .csv transaction file.')
      return
    }

    setIsUploading(true)

    try {
      const text = await file.text()

      // Client-side CSV schema & column validation
      const parseResult = parseTransactionCSV(text)
      if (!parseResult.success || !parseResult.transactions || parseResult.transactions.length === 0) {
        setUploadError(parseResult.error || 'CSV file validation failed. Ensure columns include date, amount (or credit/debit), and description.')
        setIsUploading(false)
        return
      }

      // Date range validation warning (< 60 days)
      if (parseResult.dateRange && parseResult.dateRange.days < 60) {
        setUploadWarning(`Notice: Uploaded CSV covers ${parseResult.dateRange.days} days of history. 90 days recommended for maximum precision.`)
      }

      const res = await fetch('/api/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent: text,
          occupation: selectedOccupation,
          fileName: file.name
        })
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        setUploadError(json.error || 'Failed to analyze transaction file.')
      } else {
        const count = json.scoringResult?.summaryStats?.transactionCount || parseResult.rowCount || parseResult.transactions.length
        const days = json.scoringResult?.summaryStats?.daysAnalyzed || parseResult.dateRange?.days || 90
        setUploadSuccess(`✓ Successfully analyzed "${file.name}"! Parsed ${count} transactions across ${days} days for ${selectedOccupation}.`)
        await fetchDashboard()
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error processing CSV file.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processCSVFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processCSVFile(file)
    }
  }

  const handleLoadSampleCSV = async (sampleType: 'kirana' | 'taxi') => {
    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    const path = sampleType === 'kirana' ? '/samples/sample_kirana_90day.csv' : '/samples/sample_taxi_90day.csv'
    const occ: Occupation = sampleType === 'kirana' ? 'Kirana Shop' : 'Auto/Taxi Driver'

    try {
      const resFile = await fetch(path)
      const text = await resFile.text()

      const res = await fetch('/api/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent: text,
          occupation: occ,
          fileName: sampleType === 'kirana' ? 'sample_kirana_90day.csv' : 'sample_taxi_90day.csv'
        })
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        setUploadError(json.error || 'Failed to analyze sample CSV.')
      } else {
        setSelectedOccupation(occ)
        setUploadSuccess(`Loaded and analyzed 90-day sample transaction data for ${occ}!`)
        await fetchDashboard()
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to load sample CSV.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAccountConnected = async (name: string, type: string, balance: string) => {
    try {
      await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, balance })
      })
      await fetchDashboard()
    } catch (err) {
      console.error(err)
    }
  }

  const hasData = data?.hasData ?? false
  const telemetry = data?.telemetry || {}
  const score = telemetry?.score || 0
  const tier = telemetry?.tier || 'New Member'
  const topPercent = telemetry?.topPercent || 'Pending Onboarding'
  const userName = data?.user?.name || 'New Member'
  const occupation = data?.user?.occupation || selectedOccupation

  // Gauge calculation
  const scoreRatio = score > 0 ? score / 900 : 0
  const dashOffset = 238.7 - 238.7 * scoreRatio

  const factors = telemetry?.factor_breakdown

  return (
    <DashboardLayout
      title="Dashboard Overview"
      subtitle={`Welcome back, ${userName}! Dynamic cash flow scoring & explainable telemetry.`}
    >
      <div className="space-y-8">
        {/* Onboarding Box for Users with 0 Linked Accounts & No CSV Uploaded */}
        {!hasData && !isLoading && (
          <div className="bg-gradient-to-r from-credora-navy via-slate-900 to-credora-navy text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-credora-mint-light px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Onboarding Phase 1</span>
                </div>
                <h3 className="text-2xl font-black text-white">Upload 90-Day Transaction Data or Link Bank</h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-medium">
                  Welcome to Credora! Select your declared MSME trade/occupation, then upload your 90-day transaction CSV or link a bank account to generate your deterministic Credora score.
                </p>
              </div>

              <button
                onClick={() => setIsPlaidOpen(true)}
                className="px-5 py-3 rounded-2xl bg-credora-emerald hover:bg-emerald-800 text-white font-bold text-xs shadow-lg transition flex items-center space-x-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Link via Account Aggregator</span>
              </button>
            </div>

            {/* Upload Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              {/* Occupation Selector */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-credora-mint" />
                  <span>Select Declared Occupation</span>
                </label>
                <select
                  value={selectedOccupation}
                  onChange={(e) => setSelectedOccupation(e.target.value as Occupation)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-credora-emerald"
                >
                  <option value="Kirana Shop">Kirana Shop (15–25% Volatility Band)</option>
                  <option value="Fruit/Vegetable Vendor">Fruit/Vegetable Vendor (25–40% Band)</option>
                  <option value="Auto/Taxi Driver">Auto/Taxi Driver (30–45% Band)</option>
                  <option value="Street Food Vendor">Street Food Vendor (25–35% Band)</option>
                  <option value="Tailor">Tailor (15–30% Band)</option>
                  <option value="E-commerce Delivery">E-commerce Delivery (20–35% Band)</option>
                  <option value="Salon Owner">Salon Owner (15–25% Band)</option>
                  <option value="Micro-Manufacturer / Artisan">Micro-Manufacturer / Artisan (20–35% Band)</option>
                  <option value="General Micro-Merchant">General Micro-Merchant (20–30% Band)</option>
                </select>
              </div>

              {/* CSV File Input & Drag-and-Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`md:col-span-5 space-y-1.5 p-3 rounded-2xl border transition-all ${
                  isDragging
                    ? 'bg-emerald-950/60 border-credora-mint ring-2 ring-credora-mint/40 text-credora-mint-light'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Upload className="w-3.5 h-3.5 text-credora-mint" />
                    <span>Upload 90-Day Transaction CSV</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Drag & Drop or Browse</span>
                </label>
                <label className={`flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 text-slate-300 rounded-xl px-3.5 py-3 cursor-pointer transition text-xs font-bold shadow-xs ${isDragging ? 'border-credora-mint bg-emerald-950/80 text-credora-mint-light' : ''}`}>
                  <FileText className="w-4 h-4 text-credora-mint" />
                  <span>{isUploading ? 'Validating & Analyzing CSV...' : isDragging ? 'Drop CSV File Here' : 'Choose or Drop CSV File'}</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample CSV Quick Buttons */}
              <div className="md:col-span-3 space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block">Try Sample Data</span>
                <div className="flex flex-col space-y-1.5">
                  <button
                    onClick={() => handleLoadSampleCSV('kirana')}
                    disabled={isUploading}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-credora-mint-light font-bold text-[11px] transition text-left truncate"
                  >
                    ⚡ Load Kirana Shop CSV
                  </button>
                  <button
                    onClick={() => handleLoadSampleCSV('taxi')}
                    disabled={isUploading}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[11px] transition text-left truncate"
                  >
                    ⚡ Load Taxi Driver CSV
                  </button>
                </div>
              </div>
            </div>

            {uploadWarning && (
              <div className="flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 p-3.5 rounded-xl text-xs font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>{uploadWarning}</span>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center space-x-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3.5 rounded-xl text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>
        )}

        {/* Top Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bento Hero Score Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-credora-card border border-slate-200/80 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-credora-mint/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Left Score Details */}
            <div className="flex-1 z-10 w-full text-center md:text-left space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Your Credora Score
              </span>

              <div className="flex items-baseline justify-center md:justify-start space-x-2">
                <h2 className="text-5xl sm:text-6xl font-black text-credora-navy tracking-tight">
                  {hasData && score > 0 ? score : '---'}
                </h2>
                <span className="text-lg text-slate-400 font-semibold">/ 900</span>
              </div>

              {hasData && score > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-50 text-credora-emerald text-xs font-extrabold space-x-1.5 border border-emerald-200/60 shadow-xs">
                    <TrendingUp className="w-4 h-4" />
                    <span>Version v1.0 • Evaluated for {occupation}</span>
                  </div>
                  <label className="inline-flex items-center px-3.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-credora-navy text-xs font-bold space-x-1.5 border border-slate-300 shadow-xs cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-credora-emerald" />
                    <span>{isUploading ? 'Analyzing CSV...' : 'Upload CSV'}</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                  <span>Pending Onboarding CSV Upload</span>
                </div>
              )}

              {/* AI Insight Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left mt-4 space-y-1.5 shadow-xs">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-credora-emerald mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-credora-navy">AI Insight Summary</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
                      {hasData
                        ? `Deterministic 900-point model evaluated for ${userName} (${occupation}). Baseline occupation adjuster applied.`
                        : 'Upload your 90-day transaction CSV or link a bank account to generate your cash-flow score and insights.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Circular SVG Gauge Ring */}
            <div className="w-48 h-48 relative z-10 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="9" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#006C49"
                  strokeWidth="9"
                  strokeDasharray="238.7"
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-credora-navy">{tier}</span>
                <span className="text-xs font-bold text-slate-500">{topPercent}</span>
              </div>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-credora-card border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-credora-navy">Recommended Actions</h3>
              <span className="text-xs text-credora-emerald font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full">
                {hasData ? 'Active' : 'Onboarding'}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              <Link
                href="/connections"
                className="block p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition border border-slate-200/60 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-credora-navy group-hover:text-credora-emerald transition">
                    Bank Links & Security
                  </span>
                  <span className="w-2 h-2 rounded-full bg-credora-mint"></span>
                </div>
                <p className="text-xs text-slate-500">
                  {hasData
                    ? `Manage linked institutions (${data?.activeAccountsCount || 0} active).`
                    : 'Connect your primary bank via RBI Account Aggregator.'}
                </p>
              </Link>

              <Link
                href="/insights"
                className="block p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition border border-slate-200/60 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-credora-navy group-hover:text-credora-emerald transition">
                    Score Insights & Factors
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                </div>
                <p className="text-xs text-slate-500">Transparent 6-factor pillar breakdown & trade baseline audit.</p>
              </Link>
            </div>

            <Link
              href="/simulator"
              className="w-full py-3 rounded-xl border border-slate-300 text-credora-navy font-bold text-xs hover:bg-slate-50 transition text-center block"
            >
              Test Credit Simulator
            </Link>
          </div>
        </div>

        {/* Behavioral Pillars Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-credora-navy tracking-tight">Behavioral Pillars</h3>
              <p className="text-xs text-slate-500">The 6 key money habits driving your cash-flow score</p>
            </div>
            <Link
              href="/insights"
              className="text-xs font-bold text-credora-emerald hover:underline flex items-center space-x-1"
            >
              <span>View full breakdown</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pillar 1 */}
            <div className="bg-white p-5 rounded-2xl shadow-credora-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-credora-emerald flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">INCOME</p>
                  <p className="text-xs font-bold text-credora-navy">
                    Stability ({factors ? `${factors.income_stability.subScore}/200` : '---'})
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-credora-emerald" />
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-5 rounded-2xl shadow-credora-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">SAVINGS</p>
                  <p className="text-xs font-bold text-credora-navy">
                    Retention ({factors ? `${factors.savings_behavior.subScore}/150` : '---'})
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-credora-emerald" />
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-5 rounded-2xl shadow-credora-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">EXPENSE</p>
                  <p className="text-xs font-bold text-credora-navy">
                    Predictability ({factors ? `${factors.expense_stability.subScore}/150` : '---'})
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-credora-emerald" />
            </div>

            {/* Pillar 4 */}
            <div className="bg-white p-5 rounded-2xl shadow-credora-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">PAYMENT</p>
                  <p className="text-xs font-bold text-credora-navy">
                    Discipline ({factors ? `${factors.payment_consistency.subScore}/150` : '---'})
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-credora-emerald" />
            </div>

            {/* Pillar 5 */}
            <div className="bg-white p-5 rounded-2xl shadow-credora-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">REPAYMENT</p>
                  <p className="text-xs font-bold text-credora-navy">
                    Margin ({factors ? `${factors.repayment_capacity.subScore}/150` : '---'})
                  </p>
                </div>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>

            {/* Pillar 6 */}
            <div className="bg-white p-5 rounded-2xl shadow-credora-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">RISK</p>
                  <p className="text-xs font-bold text-credora-navy">
                    Index ({factors ? `${factors.financial_risk.subScore}/100` : '---'})
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-credora-emerald" />
            </div>
          </div>
        </div>

        {/* Trust and Safety Disclosure Panel */}
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-slate-600 text-xs leading-relaxed space-y-1">
          <p className="font-bold text-slate-700 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-credora-emerald" />
            <span>Trust & Regulatory Transparency Notice</span>
          </p>
          <p>
            • Analysis is consent-based; only required transaction data is processed.
            <br />
            • The Credora Score is a simulated underwriting recommendation, not a credit decision.
            <br />
            • Final lending decisions remain with RBI-regulated lenders.
            <br />• The AI explains the score; it does not decide it.
          </p>
        </div>
      </div>

      <PlaidModal
        isOpen={isPlaidOpen}
        onClose={() => setIsPlaidOpen(false)}
        onAccountConnected={handleAccountConnected}
      />
    </DashboardLayout>
  )
}
