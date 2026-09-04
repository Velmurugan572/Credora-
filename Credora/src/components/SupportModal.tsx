'use client'

import { useState } from 'react'
import { X, HelpCircle, Search, Send, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

const FAQS = [
  {
    q: 'How is the Credora Score calculated?',
    a: 'Credora evaluates 6 primary behavioral pillars: Income Stability, Spending Patterns, Credit Utilization, Savings Velocity, History Length, and Account Diversity using Plaid bank telemetry.'
  },
  {
    q: 'Does Credora perform a hard credit inquiry?',
    a: 'No! Credora scoring is 100% soft inquiry based. Checking your score has zero negative impact on traditional FICO or Vantage scores.'
  },
  {
    q: 'Is my bank login information secure?',
    a: 'Yes. Credora connects via Plaid using 256-bit TLS bank-level encryption. Credora never sees or stores your bank credentials.'
  },
  {
    q: 'How often does my cash flow score update?',
    a: 'Your cash flow telemetry updates automatically every 24 hours as your linked checking and savings transactions sync.'
  }
]

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [search, setSearch] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const filteredFaqs = FAQS.filter(
    f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setMessage('')
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-credora-navy text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <HelpCircle className="w-5 h-5 text-credora-mint-light" />
            <h3 className="font-bold text-sm text-white">Help & Support Center</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* FAQ Search */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search FAQ & knowledge base..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-credora-emerald"
              />
            </div>

            {/* Accordion */}
            <div className="space-y-2 pt-1">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    className="w-full p-3.5 text-left font-bold text-xs text-credora-navy flex justify-between items-center hover:bg-slate-100/60"
                  >
                    <span>{faq.q}</span>
                    {openIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openIndex === idx && (
                    <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support Form */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-credora-navy">Contact Credora Support Team</h4>

            {submitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-credora-emerald" />
                <span>Support ticket submitted! Our team will reply via email within 2 hours.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-3">
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your question or issue..."
                  rows={3}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-credora-emerald"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-credora-emerald text-white text-xs font-bold hover:bg-emerald-800 flex justify-center items-center space-x-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
