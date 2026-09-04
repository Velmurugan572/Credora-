'use client'

import { useState } from 'react'
import { X, ShieldCheck, CheckCircle2, Lock, Building2, ArrowRight, RefreshCw } from 'lucide-react'

interface PlaidModalProps {
  isOpen: boolean
  onClose: () => void
  onAccountConnected: (accountName: string, accountType: string, balance: string) => void
}

const INSTITUTIONS = [
  { id: 'hdfc', name: 'HDFC Bank', logo: '🏛️', type: 'Salary & Savings' },
  { id: 'icici', name: 'ICICI Bank', logo: '💳', type: 'High Yield Savings' },
  { id: 'sbi', name: 'State Bank of India (SBI)', logo: '🏦', type: 'Checking & Credit' },
  { id: 'axis', name: 'Axis Bank', logo: '🪙', type: 'Salary & Wealth' },
  { id: 'razorpay', name: 'Razorpay Payouts', logo: '⚡', type: 'UPI & Freelance Income' },
  { id: 'zerodha', name: 'Zerodha Broking', logo: '📈', type: 'Investments & Holdings' },
]

export default function PlaidModal({ isOpen, onClose, onAccountConnected }: PlaidModalProps) {
  const [step, setStep] = useState<'select' | 'auth' | 'success'>('select')
  const [selectedBank, setSelectedBank] = useState<typeof INSTITUTIONS[0] | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  if (!isOpen) return null

  const handleSelectBank = (bank: typeof INSTITUTIONS[0]) => {
    setSelectedBank(bank)
    setStep('auth')
  }

  const handleConnectBank = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSyncing(true)

    setTimeout(() => {
      setIsSyncing(false)
      setStep('success')
      if (selectedBank) {
        onAccountConnected(
          `${selectedBank.name} Primary`,
          selectedBank.type,
          '₹2,50,000.00'
        )
      }
    }, 1200)
  }

  const handleFinish = () => {
    setStep('select')
    setSelectedBank(null)
    setUsername('')
    setPassword('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="bg-credora-navy text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-credora-mint text-credora-navy flex items-center justify-center font-black text-xs">
              AA
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Account Aggregator Link</h3>
              <p className="text-[10px] text-slate-300">RBI Regulated 256-Bit Encrypted Sync</p>
            </div>
          </div>
          <button onClick={handleFinish} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select Bank */}
        {step === 'select' && (
          <div className="p-6 space-y-4">
            <div>
              <h4 className="text-base font-extrabold text-credora-navy">Select Your Bank / AA</h4>
              <p className="text-xs text-slate-500 mt-1">Connect read-only consent telemetry for cash flow evaluation.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {INSTITUTIONS.map(bank => (
                <button
                  key={bank.id}
                  onClick={() => handleSelectBank(bank)}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-credora-mint-soft hover:border-credora-emerald transition text-left space-y-1 group"
                >
                  <span className="text-2xl block">{bank.logo}</span>
                  <p className="text-xs font-bold text-credora-navy group-hover:text-credora-emerald">{bank.name}</p>
                  <p className="text-[10px] text-slate-400">{bank.type}</p>
                </button>
              ))}
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400 font-medium flex items-center justify-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-credora-emerald" />
              <span>Zero-knowledge storage · Netbanking passwords never stored</span>
            </div>
          </div>
        )}

        {/* Step 2: Bank Auth */}
        {step === 'auth' && selectedBank && (
          <form onSubmit={handleConnectBank} className="p-6 space-y-4">
            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-3xl">{selectedBank.logo}</span>
              <div>
                <h4 className="text-sm font-bold text-credora-navy">{selectedBank.name}</h4>
                <p className="text-[10px] text-emerald-600 font-bold">RBI AA Consent OAuth</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mobile Number / Customer ID</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter registered mobile number"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-credora-emerald"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">OTP / Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-credora-emerald"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="flex-1 py-2.5 rounded-xl bg-credora-emerald text-white text-xs font-bold hover:bg-emerald-800 disabled:opacity-50 flex justify-center items-center space-x-2 shadow-sm"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Authorize AA Sync</span>}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'success' && selectedBank && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-credora-emerald mx-auto flex items-center justify-center font-bold">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-black text-credora-navy">Account Connected!</h4>
              <p className="text-xs text-slate-500 mt-1">
                {selectedBank.name} read-only financial telemetry has been linked to your Credora profile via Account Aggregator.
              </p>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-2xl bg-credora-navy text-white text-xs font-bold hover:bg-slate-800 shadow-md"
            >
              Return to Connections
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
