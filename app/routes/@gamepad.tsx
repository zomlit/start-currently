import React from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { GamepadViewer } from '@/components/GamepadViewer'
import { useProfile } from '@/hooks/useProfile'

export const Route = createFileRoute('/@gamepad')({
  component: PublicGamepadPage,
})

function PublicGamepadPage() {
  const { username } = useParams()
  const { data: profile } = useProfile('gamepad', username)

  if (!profile) {
    return <div>Profile not found</div>
  }

  return (
    <div className="w-full h-full">
      <GamepadViewer
        settings={profile.settings.specificSettings}
        isPublicView={true}
      />
    </div>
  )
} 