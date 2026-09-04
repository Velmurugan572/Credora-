'use client'

import { useState } from 'react'
import { X, Bell, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react'

interface NotificationsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface NotificationItem {
  id: number
  title: string
  desc: string
  time: string
  type: 'score' | 'sync' | 'alert'
  read: boolean
}

export default function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: 'Score Movement Update',
      desc: 'Your Credora score increased by +12 pts following 90 days of consistent debt repayment.',
      time: '10 mins ago',
      type: 'score',
      read: false
    },
    {
      id: 2,
      title: 'Chase Checking Synced',
      desc: 'Account Aggregator telemetry verified 48 recurring bill payments with zero bounce incidents.',
      time: '1 hour ago',
      type: 'sync',
      read: false
    },
    {
      id: 3,
      title: 'New Subscription Detected',
      desc: '2 new recurring charges detected. Review impact on your bill discipline score.',
      time: '3 hours ago',
      type: 'alert',
      read: true
    }
  ])

  if (!isOpen) return null

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs p-4 sm:p-6 transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 bg-credora-navy text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Bell className="w-5 h-5 text-credora-mint-light" />
            <h3 className="font-bold text-sm text-white">Notifications</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-500">
          <button onClick={markAllRead} className="hover:text-credora-emerald transition">
            Mark all read
          </button>
          <button onClick={clearAll} className="hover:text-red-600 transition flex items-center space-x-1">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No new notifications</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border text-xs space-y-1.5 transition ${
                  n.read
                    ? 'bg-slate-50/60 border-slate-200 text-slate-600'
                    : 'bg-white border-emerald-200/80 shadow-xs text-credora-navy'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {n.type === 'score' && <TrendingUp className="w-4 h-4 text-credora-emerald" />}
                    {n.type === 'sync' && <ShieldCheck className="w-4 h-4 text-blue-600" />}
                    {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    <h4 className="font-bold text-xs">{n.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">{n.time}</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">{n.desc}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
