'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react'

export default function SignInPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setIsSubmitting(true)
    const res = await login(email, password)
    setIsSubmitting(false)

    if (res.success) {
      router.push('/dashboard')
    } else {
      setError(res.error || 'Invalid credentials. Please try again.')
    }
  }

  const handleDemoLogin = async () => {
    setIsSubmitting(true)
    const res = await login('jordan.davis@example.com', 'Password123')
    setIsSubmitting(false)

    if (res.success) {
      router.push('/dashboard')
    } else {
      setError('Demo login failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
          {/* Header */}
          <div className="bg-credora-navy text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-credora-mint/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="inline-flex items-center space-x-2 bg-credora-mint/20 text-credora-mint-light px-3 py-1 rounded-full text-xs font-bold mb-3 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>256-Bit Bank Encryption</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sign In to Credora
            </h1>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Access your personalized cash flow credit dashboard.
            </p>

            {/* Tab Switcher */}
            <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 mt-6">
              <Link
                href="/signin"
                className="flex-1 py-2 rounded-xl text-xs font-bold text-center bg-credora-emerald text-white shadow-sm"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex-1 py-2 rounded-xl text-xs font-bold text-center text-slate-400 hover:text-white transition"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-credora-navy">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-credora-emerald"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-credora-navy">Password</label>
                  <button type="button" className="text-[11px] font-bold text-credora-emerald hover:underline">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-credora-emerald"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-credora-emerald text-white font-bold text-xs hover:bg-emerald-800 transition shadow-md flex justify-center items-center space-x-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="pt-2">
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full absolute"></div>
                <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold relative z-10">or</span>
              </div>
              <button
                onClick={handleDemoLogin}
                type="button"
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-credora-mint-soft text-credora-navy font-bold text-xs transition border border-slate-200 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-credora-emerald" />
                <span>Demo Quick Sign In (Jordan Davis)</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
