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
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { toast } from '@/utils/toast'

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
  const { data: profiles, isLoading: isProfilesLoading } = useProfiles('gamepad')
  const { data: profile, isLoading: isProfileLoading } = useProfile('gamepad', userId)

  const publicUrl = `${import.meta.env.VITE_PUBLIC_APP_URL}/${userId}/gamepad`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    toast.success('URL copied to clipboard')
  }

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
          <GamepadViewer 
            settings={profile?.settings?.specificSettings || defaultSettings} 
            username={userId}
          />
        </div>
      </div>
    )
  }

  const GamepadSettings = () => {
    if (!profile) return null
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Public URL</p>
            <p className="text-sm truncate">{publicUrl}</p>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            className="ml-2"
            onClick={handleCopyUrl}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <GamepadSettingsForm
          settings={profile.settings.specificSettings || defaultSettings}
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
      </div>
    )
  }

  if (!isLoaded || isProfilesLoading || isProfileLoading) {
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