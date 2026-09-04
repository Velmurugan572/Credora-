'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  BarChart3,
  Sliders,
  Link2,
  ShieldCheck,
  Sparkles,
  LogOut,
  UserCheck,
  ChevronRight,
  LogIn
} from 'lucide-react'

interface SidebarProps {
  onOpenAdvisor?: () => void
}

export default function Sidebar({ onOpenAdvisor }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, openAuthModal } = useAuth()

  const [activeAccountCount, setActiveAccountCount] = useState<number>(0)
  const [hasData, setHasData] = useState<boolean>(false)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/dashboard', { cache: 'no-store' })
        const json = await res.json()
        if (json.success) {
          setActiveAccountCount(json.activeAccountsCount || 0)
          setHasData(json.hasData || false)
        }
      } catch (err) {
        console.error('Failed to fetch sidebar status:', err)
      }
    }
    fetchStatus()
  }, [pathname])

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Credit Fitness', href: '/simulator', icon: Sliders },
    { name: 'Score Insights', href: '/insights', icon: BarChart3 },
    { name: 'Bank Links & Security', href: '/connections', icon: Link2 },
  ]

  const handleSignOut = async () => {
    await logout()
    router.push('/signin')
  }

  return (
    <aside className="w-64 bg-credora-navy text-white flex-shrink-0 hidden lg:flex flex-col justify-between p-6 border-r border-slate-800 sticky top-0 h-screen">
      <div className="space-y-8">
        {/* Brand Header */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-credora-mint text-credora-navy flex items-center justify-center font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
            C
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">
              Credora
            </h1>
            <p className="text-[10px] text-credora-mint-light font-semibold tracking-wide uppercase mt-1">
              Cash-Flow Score
            </p>
          </div>
        </Link>

        {/* User Card */}
        {isAuthenticated && user && (
          <div className="flex items-center space-x-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-credora-emerald text-white flex items-center justify-center font-bold text-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
              <p className="text-[10px] text-slate-400 truncate">Member since {user.memberSince}</p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-credora-emerald text-white shadow-md shadow-emerald-950/40 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-credora-mint-light' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-credora-mint-light" />}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Sidebar Bottom Cards & Actions */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        {/* AI Advisor Card Trigger */}
        <button
          onClick={onOpenAdvisor}
          className="w-full bg-gradient-to-r from-credora-emerald to-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all flex justify-between items-center shadow-sm group border border-emerald-500/30"
        >
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-credora-mint-light group-hover:rotate-12 transition-transform" />
            <span>AI Advisor</span>
          </div>
          <span className="text-[10px] bg-emerald-400/20 text-credora-mint-light font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
            Ask
          </span>
        </button>

        {/* Identity & Health Status Box */}
        <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Identity Verified</span>
            </span>
            <span className="text-[10px] text-slate-400">RBI AA Live</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {hasData
              ? `${activeAccountCount} bank account(s) syncing cash-flow telemetry in real-time.`
              : `0 bank accounts linked. Upload transaction CSV or link account to start.`}
          </p>
        </div>

        {/* Help & Sign Out */}
        <div className="space-y-1 pt-1">
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition text-xs font-medium text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full flex items-center space-x-3 px-3 py-2 text-credora-mint-light hover:bg-slate-800/60 rounded-xl transition text-xs font-bold text-left"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
