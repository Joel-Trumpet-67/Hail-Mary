import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid3X3, Trophy, Calendar, Users, Menu, X, Zap, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { LiveTicker } from './LiveTicker'
import clsx from 'clsx'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'picks', label: 'My Picks', icon: <Grid3X3 className="w-5 h-5" /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-5 h-5" /> },
  { id: 'playoffs', label: 'Playoffs', icon: <Zap className="w-5 h-5" /> },
  { id: 'league', label: 'League', icon: <Users className="w-5 h-5" /> },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { activeView, setActiveView, league, player, getTotalCompleteTeams, teams } = useStore()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const completeTeams = getTotalCompleteTeams()
  const totalTeams = teams.length || 32

  return (
    <div className="flex flex-col min-h-dvh bg-pitch-950">
      {/* Live ticker - always at top */}
      <LiveTicker />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-pitch-900 border-r border-white/5 shrink-0">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-turf/20 border border-turf/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-turf" />
              </div>
              <div>
                <h1 className="font-display text-xl tracking-wider text-white leading-none">HAIL MARY</h1>
                <p className="font-display text-xs tracking-widest text-white/30 leading-none mt-0.5">PICKS</p>
              </div>
            </div>
          </div>

          {/* League info */}
          {league && (
            <div className="px-4 py-4 border-b border-white/5">
              <p className="text-[10px] font-body font-semibold text-white/30 tracking-widest uppercase mb-1">League</p>
              <p className="font-display text-lg tracking-wide text-white truncate">{league.name}</p>
              <p className="text-xs text-white/40 mt-0.5">
                {player?.name} · {completeTeams}/{totalTeams} teams
              </p>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={clsx('nav-item w-full', activeView === item.id && 'active')}
              >
                {item.icon}
                <span>{item.label}</span>
                {activeView === item.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </button>
            ))}
          </nav>

          {/* Progress */}
          <div className="p-4 border-t border-white/5">
            <div className="glass rounded-xl p-3">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>Season picks</span>
                <span className="text-white">{completeTeams}/{totalTeams}</span>
              </div>
              <div className="progress-bar" style={{ '--team-color': '#22C55E' } as React.CSSProperties}>
                <div
                  className="progress-fill"
                  style={{ width: `${totalTeams > 0 ? (completeTeams / totalTeams) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-pitch-900/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-turf/20 border border-turf/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-turf" />
              </div>
              <div>
                <h1 className="font-display text-base tracking-wider text-white leading-none">HAIL MARY</h1>
              </div>
            </div>
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 rounded-lg glass text-white/60"
            >
              <Menu className="w-5 h-5" />
            </button>
          </header>

          {/* Page content */}
          <div className="pb-24 lg:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-pitch-900/95 backdrop-blur-xl border-t border-white/5 pb-safe">
        <div className="flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={clsx(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-body font-semibold tracking-widest transition-colors',
                activeView === item.id ? 'text-turf' : 'text-white/30'
              )}
            >
              <span className={clsx(
                'transition-transform',
                activeView === item.id && 'scale-110'
              )}>
                {item.icon}
              </span>
              <span className="uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile slide-out nav */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-pitch-900 border-l border-white/10 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h2 className="font-display text-lg tracking-wider">{league?.name || 'Menu'}</h2>
                <button onClick={() => setMobileNavOpen(false)} className="p-2 text-white/40">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3 flex-1">
                {league && (
                  <div className="glass rounded-xl p-3 mb-4">
                    <p className="text-xs text-white/40 mb-1">Logged in as</p>
                    <p className="font-display text-lg">{player?.name}</p>
                    <p className="text-xs text-white/30 mt-0.5">Code: {league.inviteCode}</p>
                  </div>
                )}
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveView(item.id); setMobileNavOpen(false) }}
                    className={clsx('nav-item w-full mb-1', activeView === item.id && 'active')}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
