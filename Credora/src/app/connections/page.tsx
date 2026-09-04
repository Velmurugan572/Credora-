'use client'

import DashboardLayout from '@/components/DashboardLayout'
import PlaidModal from '@/components/PlaidModal'
import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Building2,
  Lock,
  Plus,
  CheckCircle2,
  Database,
  RefreshCw,
  Trash2,
  Upload,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function ConnectionsPage() {
  const [isPlaidOpen, setIsPlaidOpen] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/connections', { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        setAccounts(data.accounts || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const toggleAccount = async (id: string) => {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', accountId: id })
      })
      const data = await res.json()
      if (data.success) {
        setAccounts(data.accounts)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/connections?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setAccounts(data.accounts)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAccountConnected = async (name: string, type: string, balance: string) => {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, balance })
      })
      const data = await res.json()
      if (data.success) {
        setAccounts(data.accounts)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <DashboardLayout
      title="Bank Links & Security Hub"
      subtitle="Manage linked financial institutions via RBI Account Aggregator (AA) network or CSV uploads"
    >
      <div className="space-y-8">
        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-credora-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full mb-2 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-credora-emerald" />
              <span>RBI Account Aggregator (AA) Encrypted</span>
            </div>
            <h2 className="text-2xl font-black text-credora-navy">Connected Accounts ({accounts.length})</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Read-only consent sync. Credora never sees or stores passwords.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsPlaidOpen(true)}
              className="px-5 py-3 rounded-2xl bg-credora-emerald hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Connect New Institution</span>
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center space-x-2"
            >
              <Upload className="w-4 h-4 text-credora-mint" />
              <span>Upload CSV</span>
            </Link>
          </div>
        </div>

        {/* Accounts List */}
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-credora-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-credora-navy">No Bank Accounts Linked Yet</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Link your primary salary or checking account (HDFC, ICICI, SBI, Axis) via RBI Account Aggregator network or upload a 90-day CSV to calculate your Credora Score.
                </p>
              </div>
              <button
                onClick={() => setIsPlaidOpen(true)}
                className="px-6 py-3 rounded-2xl bg-credora-emerald hover:bg-emerald-800 text-white font-bold text-xs transition inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Link Primary Checking Account</span>
              </button>
            </div>
          ) : (
            accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-credora-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                    {acc.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-credora-navy">{acc.name}</h4>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          acc.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {acc.type} • Synced {acc.lastSynced}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span className="text-sm font-black text-credora-navy">{acc.balance}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAccount(acc.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      {acc.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Security Disclosures */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3 text-xs leading-relaxed border border-slate-800">
          <p className="font-bold text-credora-mint-light flex items-center space-x-2 text-sm">
            <Lock className="w-4 h-4" />
            <span>Bank-Grade Encryption & RBI AA Compliance</span>
          </p>
          <p className="text-slate-300">
            Credora connects to Indian financial institutions strictly through licensed RBI Account Aggregators (AA).
            Data transmission uses 256-bit TLS encryption. Credora never stores banking credentials or login details.
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
