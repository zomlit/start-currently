import React, { useEffect, useRef, useState } from 'react'
import { useGamepad } from '@/hooks/useGamepad'
import type { GamepadSettings } from '@/components/widget-settings/GamepadSettingsForm'
import { supabase } from '@/utils/supabase/client'
import { Gamepad } from 'lucide-react'
import throttle from 'lodash/throttle'
import '../styles/gamepad.css'

interface GamepadViewerProps {
  settings?: GamepadSettings
  isPublicView?: boolean
}

export const GamepadViewer: React.FC<GamepadViewerProps> = ({
  settings,
  isPublicView = false,
}) => {
  const { gamepadState, isConnected } = useGamepad(settings?.deadzone ?? 0.1)
  const [showConnectMessage, setShowConnectMessage] = useState(true)
  const lastBroadcastState = useRef<string>('')

  useEffect(() => {
    if (isConnected) {
      setShowConnectMessage(false)
    } else {
      setShowConnectMessage(true)
    }
  }, [isConnected])

  useEffect(() => {
    if (!isPublicView && gamepadState) {
      const stateString = JSON.stringify(gamepadState)
      if (stateString !== lastBroadcastState.current) {
        supabase.channel('gamepad-inputs').send({
          type: 'broadcast',
          event: 'gamepad-update',
          payload: gamepadState,
        })
        lastBroadcastState.current = stateString
      }
    }
  }, [gamepadState, isPublicView])

  if (showConnectMessage) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
        <Gamepad className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground">No Controller Detected</h3>
          <p className="text-sm text-muted-foreground/75">Connect a controller and press any button</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center bg-black/5 rounded-lg overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className={`controller ds4 ${isConnected ? '' : 'disconnected'}`}>
          <div className="triggers">
            <span 
              className="trigger left" 
              style={{ 
                opacity: gamepadState?.buttons[6]?.value || 0,
                backgroundImage: "url('/gamepad/triggers.svg')"
              }}
            />
            <span 
              className="trigger right" 
              style={{ 
                opacity: gamepadState?.buttons[7]?.value || 0,
                backgroundImage: "url('/gamepad/triggers.svg')"
              }}
            />
          </div>

          <div className="bumpers">
            <span 
              className={`bumper left ${gamepadState?.buttons[4]?.pressed ? 'pressed' : ''}`}
              style={{ backgroundImage: "url('/gamepad/bumper.svg')" }}
            />
            <span 
              className={`bumper right ${gamepadState?.buttons[5]?.pressed ? 'pressed' : ''}`}
              style={{ backgroundImage: "url('/gamepad/bumper.svg')" }}
            />
          </div>

          <div 
            className={`touchpad ${gamepadState?.buttons[17]?.pressed ? 'pressed' : ''}`}
            style={{ backgroundImage: "url('/gamepad/touchpad.svg')" }}
          />

          <div 
            className={`meta ${gamepadState?.buttons[16]?.pressed ? 'pressed' : ''}`}
            style={{ backgroundImage: "url('/gamepad/meta.svg')" }}
          />

          <div className="arrows">
            <span className={`back ${gamepadState?.buttons[8]?.pressed ? 'pressed' : ''}`} />
            <span className={`start ${gamepadState?.buttons[9]?.pressed ? 'pressed' : ''}`} />
          </div>

          <div className="abxy">
            <span className={`button a ${gamepadState?.buttons[0]?.pressed ? 'pressed' : ''}`} />
            <span className={`button b ${gamepadState?.buttons[1]?.pressed ? 'pressed' : ''}`} />
            <span className={`button x ${gamepadState?.buttons[2]?.pressed ? 'pressed' : ''}`} />
            <span className={`button y ${gamepadState?.buttons[3]?.pressed ? 'pressed' : ''}`} />
          </div>

          <div className="sticks">
            <span 
              className={`stick left ${gamepadState?.buttons[10]?.pressed ? 'pressed' : ''}`}
              style={{
                transform: `translate(${gamepadState?.axes[0] * 20}px, ${gamepadState?.axes[1] * 20}px)`
              }}
            />
            <span 
              className={`stick right ${gamepadState?.buttons[11]?.pressed ? 'pressed' : ''}`}
              style={{
                transform: `translate(${gamepadState?.axes[2] * 20}px, ${gamepadState?.axes[3] * 20}px)`
              }}
            />
          </div>

          <div className="dpad">
            <span className={`face up ${gamepadState?.buttons[12]?.pressed ? 'pressed' : ''}`} />
            <span className={`face down ${gamepadState?.buttons[13]?.pressed ? 'pressed' : ''}`} />
            <span className={`face left ${gamepadState?.buttons[14]?.pressed ? 'pressed' : ''}`} />
            <span className={`face right ${gamepadState?.buttons[15]?.pressed ? 'pressed' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  )
}