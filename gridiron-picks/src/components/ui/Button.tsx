import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={clsx(
        'relative inline-flex items-center justify-center gap-2 font-body font-semibold rounded-xl transition-all duration-150 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed',
        // Sizes
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-5 py-3 text-sm',
        size === 'lg' && 'px-6 py-4 text-base',
        // Variants
        variant === 'primary' && 'bg-turf text-black hover:bg-turf/90',
        variant === 'secondary' && 'glass border border-white/10 text-white hover:border-white/20',
        variant === 'ghost' && 'text-white/60 hover:text-white hover:bg-pitch-700',
        variant === 'danger' && 'bg-penalty/10 border border-penalty/30 text-penalty hover:bg-penalty/20',
        className
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}
