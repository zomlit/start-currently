import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@clerk/tanstack-start'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/utils/toast'
import { WidgetLayout } from '@/components/layouts/WidgetLayout'
import { GamepadSettingsForm } from '@/components/widget-settings/GamepadSettingsForm'
import { useProfiles, useProfile } from '@/hooks/useProfiles'
import { apiMethods } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import type { Profile } from '@/types'
import { Spinner } from '@/components/Spinner'
import { GamepadViewer } from '@/components/GamepadViewer'

export const profileSchema = z.object({
  id: z.string().optional(),
  section_id: z.string(),
  settings: z.object({
    name: z.string().min(1, "Profile name is required"),
    isDefault: z.boolean().default(false),
    specificSettings: z.object({
      selectedSkin: z.enum(["ds4", "xbox", "switch"]).default("ds4"),
      showButtonPresses: z.boolean().default(true),
      showAnalogSticks: z.boolean().default(true),
      showTriggers: z.boolean().default(true),
      buttonHighlightColor: z.string().default("#ffffff"),
      buttonPressColor: z.string().default("#00ff00"),
      analogStickColor: z.string().default("#ff0000"),
      triggerColor: z.string().default("#0000ff"),
      backgroundColor: z.string().default("rgba(0, 0, 0, 0)"),
      opacity: z.number().min(0).max(1).default(1),
      scale: z.number().min(0.5).max(2).default(1),
      deadzone: z.number().min(0).max(1).default(0.1),
      touchpadEnabled: z.boolean().default(true),
      rumbleEnabled: z.boolean().default(true),
      debugMode: z.boolean().default(false),
    })
  })
})

function GamepadSection() {
  const { userId, getToken } = useAuth()
  const queryClient = useQueryClient()
  const [selectedProfileId, setSelectedProfileId] = React.useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [newProfileName, setNewProfileName] = React.useState('')

  const {
    data: profiles,
    isLoading: isProfilesLoading,
  } = useProfiles('gamepad')

  const {
    data: profile,
    isLoading: isProfileLoading,
  } = useProfile('gamepad', selectedProfileId)

  // Form setup with react-hook-form
  const methods = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profile || {
      section_id: 'gamepad',
      settings: {
        name: 'New Profile',
        isDefault: false,
        specificSettings: {
          selectedSkin: 'ds4',
          showButtonPresses: true,
          showAnalogSticks: true,
          showTriggers: true,
          buttonHighlightColor: '#ffffff',
          buttonPressColor: '#00ff00',
          analogStickColor: '#ff0000',
          triggerColor: '#0000ff',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          opacity: 1,
          scale: 1,
          deadzone: 0.1,
          touchpadEnabled: true,
          rumbleEnabled: true,
          debugMode: false,
        }
      }
    }
  })

  // ... Rest of the component implementation following the pattern from lyrics.tsx
  // Including mutations, handlers, and UI rendering

  const GamepadPreview = () => {
    const { profile } = useProfile()
    
    if (!profile) {
      return (
        <div className="flex-1 p-4 min-h-[598px]">
          <Spinner />
        </div>
      )
    }

    return (
      <div className="flex-1 p-4 min-h-[598px] flex items-center justify-center">
        <GamepadViewer settings={profile?.settings.specificSettings} />
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

  return (
    <WidgetLayout 
      preview={GamepadPreview} 
      settings={GamepadSettings}
    />
  )
}

export const Route = createFileRoute('/_app/dashboard/widgets/gamepad')({
  component: GamepadSection
}) 