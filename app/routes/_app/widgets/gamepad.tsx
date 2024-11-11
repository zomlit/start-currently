import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@clerk/tanstack-start'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { GamepadViewer } from '@/components/GamepadViewer'
import { GamepadSettingsForm } from '@/components/widget-settings/GamepadSettingsForm'
import { useProfile, useProfiles } from '@/hooks/useProfile'
import { apiMethods } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'

export const defaultSettings = {
  selectedSkin: "ds4",
  showButtonPresses: true,
  showAnalogSticks: true,
  showTriggers: true,
  buttonHighlightColor: "#ffffff",
  buttonPressColor: "#00ff00",
  analogStickColor: "#ff0000",
  triggerColor: "#0000ff",
  backgroundColor: "rgba(0, 0, 0, 0)",
  opacity: 1,
  scale: 1,
  deadzone: 0.1,
  touchpadEnabled: true,
  rumbleEnabled: true,
  debugMode: false,
} as const

function GamepadSection() {
  const { userId, getToken, isLoaded } = useAuth()
  const queryClient = useQueryClient()
  const [selectedProfileId, setSelectedProfileId] = React.useState<string | null>(null)

  const { data: profiles } = useProfiles('gamepad')
  const { data: profile } = useProfile('gamepad', selectedProfileId)

  const mutation = useMutation({
    mutationFn: async (updatedProfile: any) => {
      const token = await getToken()
      if (!token) throw new Error('No token available')
      return apiMethods.profiles.update(updatedProfile.id, updatedProfile, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', 'gamepad'] })
      queryClient.invalidateQueries({ queryKey: ['profile', 'gamepad'] })
    },
  })

  const GamepadPreview = () => {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background/50 p-6">
        <div className="relative aspect-video w-full max-w-3xl">
          <GamepadViewer settings={profile?.settings?.specificSettings || defaultSettings} />
        </div>
      </div>
    )
  }

  const GamepadSettings = () => {
    if (!profile) return null
    
    return (
      <GamepadSettingsForm
        settings={profile.settings.specificSettings}
        onUpdate={(updates) => {
          if (profile.id) {
            mutation.mutate({
              ...profile,
              settings: {
                ...profile.settings,
                specificSettings: {
                  ...profile.settings.specificSettings,
                  ...updates,
                },
              },
            })
          }
        }}
      />
    )
  }

  if (!isLoaded) {
    return <Spinner className="w-8 fill-violet-300 dark:text-white" />
  }

  if (!userId) {
    return <div>Please sign in to use the gamepad widget</div>
  }

  return (
    <WidgetLayout 
      preview={<GamepadPreview />} 
      settings={<GamepadSettings />}
    />
  )
}

export const Route = createFileRoute('/_app/widgets/gamepad')({
  component: GamepadSection
}) 