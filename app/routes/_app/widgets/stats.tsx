import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/widgets/stats')({
  component: StatsSection,
})

function StatsSection() {
  return <div></div>
}
