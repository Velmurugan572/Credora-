'use client'

import { useState } from 'react'
import { X, CheckCircle2, ArrowRight, Sparkles, ShieldCheck, Target } from 'lucide-react'

interface ActionStrategyModalProps {
  isOpen: boolean
  onClose: () => void
  strategy: {
    title: string
    category: string
    description: string
    impact: string
    steps: string[]
  } | null
}

export default function ActionStrategyModal({ isOpen, onClose, strategy }: ActionStrategyModalProps) {
  const [completed, setCompleted] = useState(false)

  if (!isOpen || !strategy) return null

  const handleApply = () => {
    setCompleted(true)
    setTimeout(() => {
      setCompleted(false)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="bg-credora-navy text-white p-6 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[10px] bg-credora-mint/20 text-credora-mint-light font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
            {strategy.category}
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-2">{strategy.title}</h3>
          <p className="text-xs text-slate-300 mt-1 font-medium">{strategy.description}</p>
        </div>

        {/* Strategy Steps Body */}
        <div className="p-6 space-y-5">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex justify-between items-center text-xs font-bold text-emerald-800">
            <span>Projected Score Impact</span>
            <span className="text-sm font-black text-credora-emerald">{strategy.impact}</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-credora-navy uppercase tracking-wider">Implementation Steps</h4>
            <div className="space-y-2 text-xs text-slate-700">
              {strategy.steps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="w-5 h-5 rounded-full bg-credora-navy text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-medium leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleApply}
            className="w-full py-3.5 rounded-2xl bg-credora-emerald text-white font-bold text-xs hover:bg-emerald-800 transition shadow-md flex justify-center items-center space-x-2"
          >
            {completed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-credora-mint-light" />
                <span>Strategy Activated!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Activate Strategy in Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
