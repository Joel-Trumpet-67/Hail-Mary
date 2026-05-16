import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Users, Trophy, ArrowRight, Loader2 } from 'lucide-react'
import { useLeague } from '@/hooks/useLeague'
import { useStore } from '@/store/useStore'

type Mode = 'landing' | 'create' | 'join'

export function HomePage() {
  const [mode, setMode] = useState<Mode>('landing')
  const [leagueName, setLeagueName] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { createLeague, joinLeague } = useLeague()
  const setActiveView = useStore((s) => s.setActiveView)

  // Pre-fill invite code from URL ?join=
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingInviteCode')
    if (pending) {
      setInviteCode(pending)
      setMode('join')
      sessionStorage.removeItem('pendingInviteCode')
    }
  }, [])

  const handleCreate = async () => {
    if (!leagueName.trim()) return setError('Enter a league name')
    if (!playerName.trim()) return setError('Enter your name')
    setError('')
    setLoading(true)
    try {
      await createLeague(leagueName.trim(), playerName.trim())
      setActiveView('picks')
    } catch (e) {
      setError('Failed to create league. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return setError('Enter an invite code')
    if (!playerName.trim()) return setError('Enter your name')
    setError('')
    setLoading(true)
    try {
      await joinLeague(inviteCode.trim(), playerName.trim())
      setActiveView('picks')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid invite code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-pitch-950 flex flex-col relative overflow-hidden">
      {/* Background field lines */}
      <div className="absolute inset-0 bg-field opacity-50 pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-turf/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ice/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16">
        <AnimatePresence mode="wait">
          {mode === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm flex flex-col items-center text-center"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mb-8"
              >
                <div className="w-24 h-24 rounded-3xl bg-turf/10 border border-turf/20 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-12 h-12 text-turf" />
                </div>
                <h1 className="font-display text-6xl tracking-wider text-white leading-none">
                  HAIL MARY
                </h1>
                <p className="font-display text-xl tracking-[0.5em] text-turf mt-1">PICKS</p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/40 font-body text-sm leading-relaxed mb-12 max-w-xs"
              >
                Pick W or L for every NFL team's 17-game season. Compete on a live leaderboard.
                Win the championship.
              </motion.p>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-2 mb-12"
              >
                {['32 Teams', '17 Games Each', 'Live Scores', 'Playoff Bracket', 'No Account'].map((f) => (
                  <span key={f} className="px-3 py-1 rounded-full glass border border-white/10 text-xs text-white/50">
                    {f}
                  </span>
                ))}
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full space-y-3"
              >
                <button
                  onClick={() => setMode('create')}
                  className="w-full flex items-center justify-center gap-2 bg-turf text-black font-body font-bold py-4 rounded-2xl text-base hover:bg-turf/90 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  Create a League
                </button>
                <button
                  onClick={() => setMode('join')}
                  className="w-full flex items-center justify-center gap-2 glass border border-white/10 text-white font-body font-semibold py-4 rounded-2xl text-base hover:border-white/20 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                  Join with Invite Code
                </button>
              </motion.div>
            </motion.div>
          )}

          {(mode === 'create' || mode === 'join') && (
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-sm"
            >
              {/* Back + title */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => { setMode('landing'); setError('') }}
                  className="p-2 rounded-xl glass text-white/40 hover:text-white transition-colors"
                >
                  ←
                </button>
                <div>
                  <p className="font-display text-xs tracking-widest text-white/30">
                    {mode === 'create' ? 'NEW LEAGUE' : 'JOIN LEAGUE'}
                  </p>
                  <h2 className="font-display text-3xl tracking-wider">
                    {mode === 'create' ? 'CREATE' : 'JOIN'}
                  </h2>
                </div>
                {mode === 'create' ? (
                  <Trophy className="w-8 h-8 text-gold ml-auto" />
                ) : (
                  <Zap className="w-8 h-8 text-turf ml-auto" />
                )}
              </div>

              <div className="space-y-4">
                {mode === 'create' && (
                  <div>
                    <label className="block text-xs font-body font-semibold text-white/40 tracking-widest uppercase mb-2">
                      League Name
                    </label>
                    <input
                      value={leagueName}
                      onChange={(e) => setLeagueName(e.target.value)}
                      placeholder="e.g. The Hail Mary League"
                      className="w-full bg-pitch-800 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-turf/50 transition-colors text-sm"
                      maxLength={40}
                    />
                  </div>
                )}

                {mode === 'join' && (
                  <div>
                    <label className="block text-xs font-body font-semibold text-white/40 tracking-widest uppercase mb-2">
                      Invite Code
                    </label>
                    <input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. XK7P2M"
                      className="w-full bg-pitch-800 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-turf/50 transition-colors text-sm font-mono tracking-widest"
                      maxLength={8}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-body font-semibold text-white/40 tracking-widest uppercase mb-2">
                    Your Name
                  </label>
                  <input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Commissioner Rex"
                    className="w-full bg-pitch-800 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-turf/50 transition-colors text-sm"
                    maxLength={24}
                    onKeyDown={(e) => e.key === 'Enter' && (mode === 'create' ? handleCreate() : handleJoin())}
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-penalty text-sm font-body"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  onClick={mode === 'create' ? handleCreate : handleJoin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-turf text-black font-body font-bold py-4 rounded-2xl text-base hover:bg-turf/90 disabled:opacity-50 transition-colors mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {mode === 'create' ? 'Create League' : 'Join League'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-white/20 mt-2">
                  No account required. Your session is saved locally.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
