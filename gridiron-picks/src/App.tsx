import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { useNFLData } from '@/hooks/useNFLData'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { HomePage } from '@/pages/HomePage'
import { PicksPage } from '@/pages/PicksPage'
import { LeaderboardPage } from '@/components/leaderboard/LeaderboardPage'
import { PlayoffsPage } from '@/components/playoffs/PlayoffsPage'
import { LeaguePage } from '@/components/league/LeaguePage'

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.99 },
}

const PAGE_TRANSITION = { duration: 0.25, ease: [0.16, 1, 0.3, 1] }

export default function App() {
  const { league, activeView, isLoading, loadingMessage } = useStore()

  // Kick off NFL data loading
  useNFLData()

  // Handle invite link on mount: ?join=XXXXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('join')
    if (code) {
      useStore.getState().setActiveView('home')
      // Store code so HomePage can pre-fill join form
      sessionStorage.setItem('pendingInviteCode', code.toUpperCase())
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  if (isLoading && !league) {
    return <LoadingScreen message={loadingMessage} />
  }

  // Not in a league yet → show landing
  if (!league) {
    return <HomePage />
  }

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          variants={PAGE_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={PAGE_TRANSITION}
          className="min-h-full"
        >
          {activeView === 'picks'       && <PicksPage />}
          {activeView === 'leaderboard' && <LeaderboardPage />}
          {activeView === 'playoffs'    && <PlayoffsPage />}
          {activeView === 'league'      && <LeaguePage />}
          {/* default fallback */}
          {!['picks','leaderboard','playoffs','league'].includes(activeView) && <PicksPage />}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  )
}
