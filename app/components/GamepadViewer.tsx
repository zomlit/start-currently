import React, { useEffect, useRef, useState } from 'react'
import { useGamepad } from '@/hooks/useGamepad'
import type { GamepadSettings } from '@/components/widget-settings/GamepadSettingsForm'
import { supabase } from '@/utils/supabase/client'
import { Gamepad } from 'lucide-react'
import '../styles/gamepad.css'

interface GamepadViewerProps {
  settings?: GamepadSettings
  isPublicView?: boolean
  username?: string
}

export const GamepadViewer: React.FC<GamepadViewerProps> = ({
  settings,
  isPublicView = false,
  username,
}) => {
  const { gamepadState, isConnected } = useGamepad(settings?.deadzone ?? 0.1)
  const [showConnectMessage, setShowConnectMessage] = useState(true)
  const [remoteGamepadState, setRemoteGamepadState] = useState<any>(null)
  const [broadcasterActive, setBroadcasterActive] = useState(false)
  const lastBroadcastState = useRef<string>('')
  const presenceChannel = useRef<any>(null)
  const lastActivityTimestamp = useRef<number>(Date.now())
  const activityCheckInterval = useRef<number>()

  useEffect(() => {
    if (!username) return

    // Set up presence channel for broadcaster status
    presenceChannel.current = supabase.channel(`presence-gamepad-${username}`, {
      config: {
        presence: {
          key: isPublicView ? 'viewer' : 'broadcaster',
        },
      },
    })

    presenceChannel.current
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.current.presenceState()
        const hasBroadcaster = state.broadcaster && state.broadcaster.length > 0
        setBroadcasterActive(hasBroadcaster)
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED' && !isPublicView) {
          await presenceChannel.current.track({ online: true })
        }
      })

    return () => {
      if (presenceChannel.current) {
        presenceChannel.current.unsubscribe()
      }
    }
  }, [username, isPublicView])

  useEffect(() => {
    if (isPublicView && username) {
      // Subscribe to the user's gamepad channel for input updates
      const channel = supabase.channel(`gamepad-${username}`)
        .on('broadcast', { event: 'gamepad-update' }, ({ payload }) => {
          setRemoteGamepadState(payload)
          lastActivityTimestamp.current = Date.now()
          setShowConnectMessage(false)
        })
        .subscribe()

      // Set up activity check interval
      activityCheckInterval.current = window.setInterval(() => {
        const inactiveTime = Date.now() - lastActivityTimestamp.current
        if (inactiveTime > 5000) { // 5 seconds without updates
          setShowConnectMessage(true)
          setBroadcasterActive(false)
        }
      }, 1000)

      return () => {
        supabase.removeChannel(channel)
        if (activityCheckInterval.current) {
          clearInterval(activityCheckInterval.current)
        }
      }
    }
  }, [isPublicView, username])

  useEffect(() => {
    // Only broadcast if not in public view and connected
    if (!isPublicView && isConnected && gamepadState && username) {
      const stateString = JSON.stringify(gamepadState)
      if (stateString !== lastBroadcastState.current) {
        supabase.channel(`gamepad-${username}`).send({
          type: 'broadcast',
          event: 'gamepad-update',
          payload: gamepadState,
        })
        lastBroadcastState.current = stateString
        lastActivityTimestamp.current = Date.now()
        setBroadcasterActive(true)
        setShowConnectMessage(false)
      }
    }
  }, [gamepadState, isPublicView, isConnected, username])

  // Use remoteGamepadState for public view, local gamepadState otherwise
  const activeGamepadState = isPublicView ? remoteGamepadState : gamepadState

  if (showConnectMessage) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
        <Gamepad className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground">
            {isPublicView 
              ? broadcasterActive 
                ? "Waiting for controller input..." 
                : "No controller input detected"
              : "No Controller Detected"}
          </h3>
          <p className="text-sm text-muted-foreground/75">
            {isPublicView
              ? "Make sure the controller is connected and the overlay is active"
              : "Connect a controller and press any button"}
          </p>
        </div>
      </div>
    )
  }

  // Add the controller UI rendering here
  return (
    <div className="relative flex items-center justify-center bg-black/5 rounded-lg overflow-hidden">
      <div 
        className="gamepad-container"
        style={{
          backgroundColor: settings?.backgroundColor || 'transparent',
          opacity: settings?.opacity ?? 1,
          transform: `scale(${settings?.scale ?? 1})`,
        }}
      >
        {/* Base controller image */}
        <div className={`gamepad-base ${settings?.selectedSkin || 'ds4'}`}>
          {/* Buttons */}
          {activeGamepadState?.buttons.map((button: any, index: number) => (
            <div
              key={index}
              className={`button button-${index} ${button.pressed ? 'pressed' : ''}`}
              style={{
                '--highlight-color': settings?.buttonHighlightColor || '#ffffff',
                '--press-color': settings?.buttonPressColor || '#00ff00',
              } as React.CSSProperties}
            />
          ))}

          {/* Analog sticks */}
          {settings?.showAnalogSticks && activeGamepadState?.axes && (
            <>
              <div 
                className="analog-stick left"
                style={{
                  transform: `translate(${activeGamepadState.axes[0] * 20}px, ${activeGamepadState.axes[1] * 20}px)`,
                  backgroundColor: settings.analogStickColor,
                }}
              />
              <div 
                className="analog-stick right"
                style={{
                  transform: `translate(${activeGamepadState.axes[2] * 20}px, ${activeGamepadState.axes[3] * 20}px)`,
                  backgroundColor: settings.analogStickColor,
                }}
              />
            </>
          )}

          {/* Triggers */}
          {settings?.showTriggers && activeGamepadState?.buttons && (
            <>
              <div 
                className="trigger left"
                style={{
                  transform: `scaleY(${activeGamepadState.buttons[6].value})`,
                  backgroundColor: settings.triggerColor,
                }}
              />
              <div 
                className="trigger right"
                style={{
                  transform: `scaleY(${activeGamepadState.buttons[7].value})`,
                  backgroundColor: settings.triggerColor,
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}