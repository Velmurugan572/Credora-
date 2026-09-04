'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { X, Settings, ShieldCheck, User, Bell, CheckCircle2, Save } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuth()
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [scoreSMS, setScoreSMS] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="bg-credora-navy text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-credora-mint-light" />
            <h3 className="font-bold text-sm text-white">Account Settings & Preferences</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Profile Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-credora-navy text-white font-bold text-base flex items-center justify-center border border-slate-300">
              {user ? user.name.slice(0, 2).toUpperCase() : 'JD'}
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-credora-navy">{user ? user.name : 'Jordan Davis'}</h4>
              <p className="text-xs text-slate-500">{user ? user.email : 'jordan.davis@example.com'}</p>
              <span className="text-[10px] text-credora-emerald font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                Pro Cash Flow Member
              </span>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Notification Preferences
            </h4>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                <span>Email Score Notifications</span>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-credora-emerald cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                <span>SMS Score Movement Alerts</span>
                <input
                  type="checkbox"
                  checked={scoreSMS}
                  onChange={e => setScoreSMS(e.target.checked)}
                  className="w-4 h-4 accent-credora-emerald cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                <span>Weekly Telemetry Summary</span>
                <input
                  type="checkbox"
                  checked={weeklySummary}
                  onChange={e => setWeeklySummary(e.target.checked)}
                  className="w-4 h-4 accent-credora-emerald cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-credora-emerald text-white font-bold text-xs hover:bg-emerald-800 transition shadow-md flex justify-center items-center space-x-2"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-credora-mint-light" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
