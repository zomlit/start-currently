import React from 'react'
import { useParams } from '@tanstack/react-router'
import { GamepadViewer } from './GamepadViewer'
import { defaultSettings } from '@/routes/_app/widgets/gamepad'
import { useProfile } from '@/hooks/useProfile'

export function PublicGamepadView() {
  const { username } = useParams({ from: '/$username/gamepad' })
  const { data: profile } = useProfile('gamepad', username)

  return (
    <div className="flex h-full w-full items-center justify-center bg-background/50 p-6">
      <div className="relative aspect-video w-full max-w-3xl">
        <GamepadViewer 
          settings={profile?.settings?.specificSettings || defaultSettings} 
          isPublicView={true}
          username={username}
        />
      </div>
    </div>
  )
}