// @/app/components/AnimatedCard.tsx

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedCardProps {
  children: React.ReactNode
  initialHeight?: number
  className?: string
  animationDuration?: number
  animationEase?: string
  springStiffness?: number
  springDamping?: number
  animateOnMount?: boolean
  animateOnUpdate?: boolean
  onAnimationComplete?: () => void
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  initialHeight = 0,
  className = '',
  animationDuration = 0.5,
  animationEase = 'easeInOut',
  springStiffness = 500,
  springDamping = 25,
  animateOnMount = true,
  animateOnUpdate = true,
  onAnimationComplete,
}) => {
  const [height, setHeight] = useState<number | 'auto'>(initialHeight)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === contentRef.current) {
            setHeight(entry.contentRect.height)
          }
        }
      })

      resizeObserver.observe(contentRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        className={`min-h-[100px] rounded-lg bg-white/10 p-4 shadow-lg backdrop-blur-lg ${className}`}
        initial={animateOnMount ? { opacity: 0, height: initialHeight } : false}
        animate={{
          opacity: 1,
          height: animateOnUpdate ? `calc(${height}px + 2.2rem)` : 'auto',
        }}
        exit={{ opacity: 0, height: 0 }}
        transition={{
          duration: animationDuration,
          ease: animationEase,
          height: {
            type: 'spring',
            stiffness: springStiffness,
            damping: springDamping,
          },
        }}
        onAnimationComplete={onAnimationComplete}
      >
        <div ref={contentRef}>{children}</div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AnimatedCard
