'use client'

import { useState, useEffect } from 'react'
import { ShieldCheck, Sparkles } from 'lucide-react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing cash flow telemetry...')
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Smooth progress animation over ~1.4 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        const next = prev + Math.floor(Math.random() * 12 + 8)
        return next > 100 ? 100 : next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress < 40) {
      setStatusText('Initializing cash flow telemetry...')
    } else if (progress < 80) {
      setStatusText('Connecting 256-bit bank encryption...')
    } else if (progress < 100) {
      setStatusText('Validating behavioral pillars...')
    } else {
      setStatusText('Credora Score Engine ready.')
      
      // Trigger smooth fade out
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true)
      }, 300)

      // Hide completely after fade transition completes
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
      }, 900)

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [progress])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 bg-credora-navy flex flex-col items-center justify-center p-6 transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-credora-mint/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-6">
        {/* Animated Brand Logo Badge */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-credora-mint/25 blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-2xl bg-credora-navy text-credora-mint flex items-center justify-center font-black text-3xl border border-emerald-500/40 shadow-2xl">
            C
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight">Credora</h1>
          <p className="text-[11px] font-extrabold text-credora-mint-light uppercase tracking-widest">
            Visible Creditworthiness
          </p>
        </div>

        {/* Progress Bar & Counter Container */}
        <div className="w-full space-y-2.5 pt-2">
          <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-credora-emerald via-credora-mint to-emerald-300 transition-all duration-200 ease-out shadow-credora-glow"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-credora-emerald animate-pulse" />
              <span>{statusText}</span>
            </span>
            <span className="font-mono text-credora-mint-light font-bold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
