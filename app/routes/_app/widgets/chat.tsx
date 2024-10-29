import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/widgets/chat')({
  component: ChatSection,
})

function ChatSection() {
  return <div></div>
}
