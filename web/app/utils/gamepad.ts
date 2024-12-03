export interface GamepadButtonState {
  pressed: boolean;
  value: number;
}

export interface GamepadState {
  buttons: GamepadButtonState[];
  axes: number[];
  timestamp?: number;
}

export const DEFAULT_DEADZONE = 0.15;

export const hasSignificantChange = (
  currentState: GamepadState | null,
  lastState: GamepadState | null,
  deadzone: number = DEFAULT_DEADZONE
): boolean => {
  if (!currentState || !lastState) return true;

  // Check digital buttons (non-triggers) for state changes
  for (let i = 0; i < currentState.buttons.length; i++) {
    // Skip triggers (buttons 6 and 7)
    if (i === 6 || i === 7) continue;

    const current = currentState.buttons[i].pressed;
    const last = lastState.buttons[i].pressed;

    // Only register changes in press state
    if (current !== last) return true;
  }

  // Check triggers (buttons 6 and 7) for analog value changes
  for (const i of [6, 7]) {
    const current = currentState.buttons[i].value;
    const last = lastState.buttons[i].value;

    // Check for significant change in analog value
    if (Math.abs((current || 0) - (last || 0)) > 0.01) return true;
  }

  // Check analog sticks for significant movement
  for (let i = 0; i < currentState.axes.length; i++) {
    const currentValue = Math.abs(currentState.axes[i]);
    const lastValue = Math.abs(lastState.axes[i]);

    // Only report changes if either value is above deadzone
    if (currentValue > deadzone || lastValue > deadzone) {
      if (Math.abs(currentValue - lastValue) > 0.01) return true;
    }
  }

  return false;
};
