import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Share2, LogOut, Crown, Shield } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { format } from 'date-fns'

export function LeaguePage() {
  const { league, player, clearSession } = useStore()
  const [copied, setCopied] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  if (!league || !player) return null

  const inviteUrl = `${window.location.origin}?join=${league.inviteCode}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Join ${league.name} on Hail Mary`,
        text: `Pick every NFL game this season! Use code ${league.inviteCode}`,
        url: inviteUrl,
      })
    } else {
      handleCopy()
    }
  }

  const phaseLabel: Record<string, string> = {
    picks: '🏈 Pick Phase — Make your season picks',
    season: '⚡ Season Live — Scores updating',
    playoffs: '🏆 Playoffs — Bracket picks open',
    final: '🎉 Season Complete',
  }

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <div className="mb-6">
        <p className="font-display text-xs tracking-widest text-white/30">YOUR LEAGUE</p>
        <h1 className="font-display text-4xl tracking-wider leading-tight">{league.name.toUpperCase()}</h1>
        <p className="text-xs text-white/30 mt-1">
          Created by {league.createdBy} · {format(new Date(league.createdAt), 'MMM d, yyyy')}
        </p>
      </div>

      {/* Phase status */}
      <div className="glass rounded-2xl p-4 mb-6 border border-white/5">
        <p className="text-sm text-white/60">{phaseLabel[league.phase] || '—'}</p>
      </div>

      {/* Invite section */}
      <div className="mb-6">
        <p className="font-display text-xs tracking-widest text-white/30 mb-3">INVITE PLAYERS</p>
        <div className="glass-strong rounded-2xl p-5 border border-white/10">
          {/* Invite code big display */}
          <div className="text-center mb-5">
            <p className="text-xs text-white/30 tracking-widest mb-2">INVITE CODE</p>
            <p className="font-mono text-4xl font-bold tracking-[0.3em] text-white">
              {league.inviteCode}
            </p>
          </div>

          {/* URL bar */}
          <div className="flex items-center gap-2 bg-pitch-800 rounded-xl px-3 py-2.5 mb-4">
            <p className="flex-1 text-xs text-white/30 truncate font-mono">{inviteUrl}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="shrink-0 text-white/40 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-turf" /> : <Copy className="w-4 h-4" />}
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handleCopy} icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button variant="primary" onClick={handleShare} icon={<Share2 className="w-4 h-4" />}>
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Your profile */}
      <div className="mb-6">
        <p className="font-display text-xs tracking-widest text-white/30 mb-3">YOUR PROFILE</p>
        <div className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-turf/20 border border-turf/30 flex items-center justify-center">
            <Crown className="w-5 h-5 text-turf" />
          </div>
          <div>
            <p className="font-display text-xl tracking-wide">{player.name.toUpperCase()}</p>
            <p className="text-xs text-white/30">
              Joined {format(new Date(player.joinedAt), 'MMM d')}
              {league.createdBy === player.name && (
                <span className="ml-2 text-gold">· Commissioner</span>
              )}
            </p>
          </div>
          <Shield className="w-4 h-4 text-white/10 ml-auto" />
        </div>
      </div>

      {/* How to play */}
      <div className="mb-8">
        <p className="font-display text-xs tracking-widest text-white/30 mb-3">HOW TO PLAY</p>
        <div className="space-y-2">
          {[
            ['1', 'Go to My Picks and pick W or L for every game of all 32 teams.'],
            ['2', 'Once the season starts, correct picks earn 1 point each.'],
            ['3', 'When the playoffs begin, pick the bracket — correct picks = 3× points.'],
            ['4', 'Highest total points at the end wins the championship.'],
          ].map(([num, text]) => (
            <div key={num} className="flex gap-3 text-sm text-white/40">
              <span className="font-display text-turf shrink-0">{num}.</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Leave league */}
      <Button
        variant="danger"
        onClick={() => setConfirmLeave(true)}
        icon={<LogOut className="w-4 h-4" />}
        className="w-full"
      >
        Leave League
      </Button>

      {/* Confirm leave modal */}
      <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="Leave League">
        <div className="p-5">
          <p className="text-white/60 text-sm mb-6">
            Are you sure? Your picks will be lost locally. You can rejoin with the invite code{' '}
            <span className="font-mono text-white">{league.inviteCode}</span>.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setConfirmLeave(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={clearSession} className="flex-1">
              Leave
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
