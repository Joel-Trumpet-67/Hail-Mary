import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-pitch-950 flex flex-col items-center justify-center z-50">
      {/* Animated logo */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-turf/10 border border-turf/20 flex items-center justify-center">
          <Zap className="w-10 h-10 text-turf" />
        </div>
        {/* Glow ring */}
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl border border-turf/20"
        />
      </motion.div>

      <h1 className="font-display text-3xl tracking-widest text-white mb-1">HAIL MARY</h1>
      <p className="font-display text-sm tracking-widest text-white/30 mb-10">PICKS</p>

      {/* Loading bar */}
      <div className="w-48 h-0.5 bg-pitch-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-turf rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <p className="mt-4 text-xs text-white/30 font-body tracking-widest">
        {message.toUpperCase()}
      </p>
    </div>
  )
}
