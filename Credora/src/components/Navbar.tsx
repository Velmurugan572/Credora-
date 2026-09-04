'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ShieldCheck, BarChart3, Sliders, Link2, LayoutDashboard, Menu, X, ArrowRight, User } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Credit Fitness', href: '/simulator' },
    { name: 'Score Insights', href: '/insights' },
    { name: 'Connections', href: '/connections' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-credora-navy text-credora-mint flex items-center justify-center font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <span className="text-2xl font-black text-credora-navy tracking-tight">Credora</span>
              <span className="block text-[9px] text-credora-emerald font-extrabold tracking-wider uppercase -mt-1">
                Visible Credit
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-credora-navy text-white shadow-sm'
                      : 'text-slate-600 hover:text-credora-navy hover:bg-white/60'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-credora-navy font-bold text-xs transition border border-slate-300"
              >
                <div className="w-6 h-6 rounded-lg bg-credora-navy text-white flex items-center justify-center text-[10px]">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span>Dashboard ({user.name.split(' ')[0]})</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2.5 text-xs font-bold text-credora-navy hover:bg-slate-100 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold bg-credora-emerald text-white hover:bg-emerald-800 rounded-xl shadow-md transition transform hover:-translate-y-0.5"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold ${
                  isActive
                    ? 'bg-credora-navy text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
            {!isAuthenticated && (
              <>
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl border border-slate-300 text-credora-navy font-bold text-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-credora-emerald text-white font-bold text-xs shadow-md"
                >
                  Sign Up / Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
