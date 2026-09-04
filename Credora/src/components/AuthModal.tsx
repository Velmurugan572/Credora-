'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { X, Lock, Mail, User, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, signup } = useAuth()
  const router = useRouter()

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode || 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isAuthModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.')
        return
      }
      if (password !== confirmPassword) {
        setError('Password and Confirm Password do not match.')
        return
      }
    }

    setIsSubmitting(true)

    let res: { success: boolean; error?: string }
    if (mode === 'signin') {
      res = await login(email, password)
    } else {
      res = await signup(fullName, email, password)
    }

    setIsSubmitting(false)

    if (res.success) {
      closeAuthModal()
      router.push('/dashboard')
    } else {
      setError(res.error || 'Authentication failed. Please check your details.')
    }
  }

  const handleDemoLogin = async () => {
    setIsSubmitting(true)
    const res = await login('jordan.davis@example.com', 'Password123')
    setIsSubmitting(false)

    if (res.success) {
      closeAuthModal()
      router.push('/dashboard')
    } else {
      setError('Demo login failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-credora-navy/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-credora-navy hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-credora-navy text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-credora-mint/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="inline-flex items-center space-x-2 bg-credora-mint/20 text-credora-mint-light px-3 py-1 rounded-full text-xs font-bold mb-3 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit Bank Encryption</span>
          </div>

          <h3 className="text-2xl font-black tracking-tight text-white">
            {mode === 'signin' ? 'Welcome Back to Credora' : 'Start Your Score Today'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            {mode === 'signin'
              ? 'Enter your credentials to access your cash flow dashboard.'
              : 'Create your free account to evaluate your cash flow credit score.'}
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 mt-6">
            <button
              onClick={() => {
                setMode('signin')
                setError('')
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'signin'
                  ? 'bg-credora-emerald text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup')
                setError('')
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'signup'
                  ? 'bg-credora-emerald text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <div className="p-6 sm:p-8 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-credora-navy">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-credora-emerald"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-credora-navy">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-credora-emerald"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-credora-navy">Password</label>
                {mode === 'signin' && (
                  <button type="button" className="text-[11px] font-bold text-credora-emerald hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-credora-emerald"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-credora-navy">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-credora-emerald"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-credora-emerald text-white font-bold text-xs hover:bg-emerald-800 transition shadow-md flex justify-center items-center space-x-2 disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="relative flex items-center justify-center my-1">
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
    </div>
  )
}
