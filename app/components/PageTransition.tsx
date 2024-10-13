import React from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  Outlet,
  useLocation,
  useMatches,
  useMatch,
} from '@tanstack/react-router'

export const mainTransitionProps = {
  initial: { y: -20, opacity: 0, position: 'relative' },
  animate: { y: 0, opacity: 1, damping: 5 },
  exit: { y: 60, opacity: 0 },
  transition: {
    type: 'spring',
    stiffness: 150,
    damping: 10,
  },
} as const

export const postTransitionProps = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1, damping: 5 },
  exit: { y: 60, opacity: 0 },
  transition: {
    type: 'spring',
    stiffness: 150,
    damping: 10,
  },
} as const

export const PageTransition: React.FC = () => {
  const location = useLocation()
  const matches = useMatches()
  const match = useMatch({ strict: false })
  const nextMatchIndex = matches.findIndex((d) => d.id === match.id) + 1
  const nextMatch = matches[nextMatchIndex]

  return (
    <AnimatePresence mode="wait">
      <Outlet key={nextMatch?.id || location.pathname} />
    </AnimatePresence>
  )
}
