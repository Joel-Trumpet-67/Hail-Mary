import { useCallback, useRef } from 'react'

export function useRipple() {
  const containerRef = useRef<HTMLElement | null>(null)

  const createRipple = useCallback(
    (e: React.MouseEvent | React.TouchEvent, color = 'rgba(255,255,255,0.3)') => {
      const container = e.currentTarget as HTMLElement
      const rect = container.getBoundingClientRect()

      let x: number, y: number
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left
        y = e.touches[0].clientY - rect.top
      } else {
        x = (e as React.MouseEvent).clientX - rect.left
        y = (e as React.MouseEvent).clientY - rect.top
      }

      const ripple = document.createElement('span')
      const size = Math.max(rect.width, rect.height) * 2
      ripple.className = 'ripple'
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        background: ${color};
        opacity: 0.4;
      `

      container.style.position = 'relative'
      container.style.overflow = 'hidden'
      container.appendChild(ripple)

      ripple.addEventListener('animationend', () => ripple.remove())
    },
    []
  )

  return { createRipple, containerRef }
}

// Haptic feedback (mobile)
export function haptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 40
    navigator.vibrate(duration)
  }
}
