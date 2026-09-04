'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import AiAdvisorModal from '@/components/AiAdvisorModal'
import AuthModal from '@/components/AuthModal'
import NotificationsDrawer from '@/components/NotificationsDrawer'
import SettingsModal from '@/components/SettingsModal'
import SupportModal from '@/components/SupportModal'
import { useAuth } from '@/context/AuthContext'
import {
  Bell,
  Settings,
  LifeBuoy,
  Sparkles,
  LayoutDashboard,
  Sliders,
  BarChart3,
  Link2,
  Menu,
  X,
  LogIn
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, openAuthModal } = useAuth()

  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-credora-emerald border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-500">Loading Credora Dashboard...</span>
        </div>
      </div>
    )
  }

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Credit Fitness', href: '/simulator', icon: Sliders },
    { name: 'Score Insights', href: '/insights', icon: BarChart3 },
    { name: 'Bank Links', href: '/connections', icon: Link2 },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <div className="flex flex-1 relative">
        {/* Shared Desktop Sidebar */}
        <Sidebar onOpenAdvisor={() => setIsAdvisorOpen(true)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
          {/* Desktop Top Header */}
          <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
            <div>
              <h1 className="text-2xl font-extrabold text-credora-navy tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center space-x-4">
              {/* Support Button */}
              <button
                onClick={() => setIsSupportOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-credora-navy transition px-2 py-1"
              >
                <LifeBuoy className="w-4 h-4 text-credora-emerald" />
                <span>Support & FAQ</span>
              </button>

              <div className="h-5 w-px bg-slate-200"></div>

              {/* AI Advisor Button */}
              <button
                onClick={() => setIsAdvisorOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-credora-emerald text-white text-xs font-bold hover:bg-emerald-800 transition shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-credora-mint-light" />
                <span>AI Advisor</span>
              </button>

              <div className="h-5 w-px bg-slate-200"></div>

              {/* Notifications Button */}
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="p-2 text-slate-500 hover:text-credora-navy hover:bg-slate-100 rounded-xl transition relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-credora-mint"></span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-500 hover:text-credora-navy hover:bg-slate-100 rounded-xl transition"
                title="Account Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* User Profile Avatar / Sign In Trigger */}
              {isAuthenticated && user ? (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center space-x-3 pl-2 border-l border-slate-200 text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-credora-navy text-white font-bold text-xs flex items-center justify-center border border-slate-300 shadow-xs group-hover:bg-credora-emerald transition">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-credora-emerald transition">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold">{user.plan}</p>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-credora-navy text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </header>

          {/* Mobile Header */}
          <header className="flex lg:hidden items-center justify-between px-4 py-3.5 bg-credora-navy text-white border-b border-slate-800 sticky top-0 z-30">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-credora-mint text-credora-navy flex items-center justify-center font-extrabold text-sm">
                C
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">Credora</span>
            </Link>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="p-2 text-slate-300 hover:text-white"
              >
                <Bell className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsAdvisorOpen(true)}
                className="p-2 rounded-lg bg-credora-emerald text-white text-xs font-bold flex items-center space-x-1"
              >
                <Sparkles className="w-4 h-4 text-credora-mint-light" />
                <span className="text-[11px]">AI</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </header>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-credora-navy border-b border-slate-800 px-4 py-4 space-y-2 text-white">
              {navLinks.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive ? 'bg-credora-emerald text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
                <button onClick={() => { setMobileMenuOpen(false); setIsSettingsOpen(true) }}>
                  Settings
                </button>
                <button onClick={() => { setMobileMenuOpen(false); setIsSupportOpen(true) }}>
                  Help & FAQ
                </button>
              </div>
            </div>
          )}

          {/* Main Body */}
          <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center py-2.5 px-2 lg:hidden z-40 shadow-lg">
        {navLinks.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center text-xs transition ${
                isActive ? 'text-credora-emerald font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-credora-emerald' : 'text-slate-400'}`} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Global Modals & Drawers */}
      <AiAdvisorModal isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} />
      <AuthModal />
      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  )
}
