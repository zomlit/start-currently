import { useState, useEffect, useRef } from 'react'

interface GamepadState {
  buttons: {
    pressed: boolean
    value: number
  }[]
  axes: number[]
  timestamp: number
}

export function useGamepad(deadzone: number = 0.1) {
  const [gamepadState, setGamepadState] = useState<GamepadState | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const lastState = useRef<string>('')

  useEffect(() => {
    let animationFrameId: number
    let lastInputTime = 0
    const IDLE_TIMEOUT = 1000 // 1 second timeout for idle state

    const handleGamepadConnected = () => {
      setIsConnected(true)
    }

    const handleGamepadDisconnected = () => {
      setIsConnected(false)
      setGamepadState(null)
      lastState.current = ''
    }

    const handleGamepadInput = () => {
      const gamepads = navigator.getGamepads()
      const gamepad = gamepads[0]

      if (gamepad) {
        setIsConnected(true)
        
        // Create new state without timestamp
        const newState: GamepadState = {
          buttons: gamepad.buttons.map(button => ({
            pressed: button.pressed,
            value: Math.abs(button.value) < deadzone ? 0 : button.value
          })),
          axes: gamepad.axes.map(axis => 
            Math.abs(axis) < deadzone ? 0 : axis
          ),
          timestamp: Date.now() // Only update timestamp when there are actual changes
        }

        // Create comparison string without timestamp
        const comparisonState = {
          buttons: newState.buttons,
          axes: newState.axes
        }
        const newStateString = JSON.stringify(comparisonState)

        // Only update if there are actual changes or if we've been idle
        if (newStateString !== lastState.current) {
          lastState.current = newStateString
          lastInputTime = Date.now()
          setGamepadState(newState)
        } else if (Date.now() - lastInputTime > IDLE_TIMEOUT) {
          // If we've been idle, stop sending updates
          setGamepadState(null)
        }
      }

      animationFrameId = requestAnimationFrame(handleGamepadInput)
    }

    window.addEventListener('gamepadconnected', handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)
    animationFrameId = requestAnimationFrame(handleGamepadInput)

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected)
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected)
      cancelAnimationFrame(animationFrameId)
    }
  }, [deadzone])

  return { gamepadState, isConnected }
} 