import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/tanstack-start";
import { useGamepadStore } from "@/store/gamepadStore";
import { defaultGamepadSettings } from "@/lib/gamepad-settings";
import type { GamepadState, GamepadSettings } from "@/types/gamepad";
import { Loader2, Gamepad } from "lucide-react";

interface GamepadViewerProps {
  settings?: Partial<GamepadSettings>;
  username?: string;
  gamepadState?: GamepadState | null;
  isPublicView?: boolean;
}

export function GamepadViewer({ 
  settings = defaultGamepadSettings, 
  username, 
  gamepadState,
  isPublicView = false 
}: GamepadViewerProps) {
  const { settings: storeSettings, loadPublicSettings } = useGamepadStore();
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings and subscribe to changes
  useEffect(() => {
    async function loadSettings() {
      if (!username) return;
      
      try {
        await loadPublicSettings(username);
        setIsLoadingSettings(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setError('Failed to load settings');
        setIsLoadingSettings(false);
      }
    }

    loadSettings();
  }, [username, loadPublicSettings]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (isLoadingSettings) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!gamepadState) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
        <Gamepad className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground">
            {isPublicView ? "Waiting for controller input..." : "No Controller Detected"}
          </h3>
          <p className="text-sm text-muted-foreground/75">
            {isPublicView
              ? "Make sure the controller is connected and the overlay is active"
              : "Connect a controller and press any button"}
          </p>
        </div>
      </div>
    );
  }

  const { buttons, axes } = gamepadState;

  return (
    <div 
      className="relative flex items-center justify-center bg-black/5 rounded-lg overflow-hidden"
      style={{
        backgroundColor: storeSettings.backgroundColor,
        transform: `scale(${storeSettings.scale})`,
      }}
    >
      <div className={`gamepad-base ${storeSettings.selectedSkin || 'ds4'}`}>
        {/* Face Buttons */}
        <div className="face-buttons">
          <button 
            className={`face-button cross ${buttons[0] ? 'pressed' : ''}`}
            style={{ backgroundColor: storeSettings.buttonColor }}
          />
          <button 
            className={`face-button circle ${buttons[1] ? 'pressed' : ''}`}
            style={{ backgroundColor: storeSettings.buttonColor }}
          />
          <button 
            className={`face-button square ${buttons[2] ? 'pressed' : ''}`}
            style={{ backgroundColor: storeSettings.buttonColor }}
          />
          <button 
            className={`face-button triangle ${buttons[3] ? 'pressed' : ''}`}
            style={{ backgroundColor: storeSettings.buttonColor }}
          />
        </div>

        {/* D-Pad */}
        <div className="d-pad">
          <button 
            className={`d-pad-button up ${buttons[12] ? 'pressed' : ''}`}
            style={{ backgroundColor: storeSettings.buttonColor }}
          />
          <button 
            className={`d-pad-button right ${buttons[15] ? 'pressed' : ''}`}
            style={{ backgroundColor: storeSettings.buttonColor }}
          />
          <button 
            className={`d-pad-button down ${buttons[13] ? 'pressed' : ''}`}
            style={{ backgroundColor: storeSettings.buttonColor }}
          />
          <button 
            className={`d-pad-button left ${buttons[14] ? 'pressed' : ''}`}
            style={{ backgroundColor: storeSettings.buttonColor }}
          />
        </div>

        {/* Analog Sticks */}
        {storeSettings.showAnalogSticks && (
          <>
            <div 
              className="analog-stick left"
              style={{
                transform: `translate(${axes[0] * 20}px, ${axes[1] * 20}px)`,
                backgroundColor: storeSettings.stickColor
              }}
            />
            <div 
              className="analog-stick right"
              style={{
                transform: `translate(${axes[2] * 20}px, ${axes[3] * 20}px)`,
                backgroundColor: storeSettings.stickColor
              }}
            />
          </>
        )}

        {/* Triggers */}
        {storeSettings.showTriggers && (
          <div className="triggers">
            <div 
              className={`trigger l2 ${buttons[6] ? 'pressed' : ''}`}
              style={{ 
                backgroundColor: storeSettings.triggerColor,
                transform: `scaleY(${buttons[6] ? 0.7 : 1})`
              }}
            />
            <div 
              className={`trigger r2 ${buttons[7] ? 'pressed' : ''}`}
              style={{ 
                backgroundColor: storeSettings.triggerColor,
                transform: `scaleY(${buttons[7] ? 0.7 : 1})`
              }}
            />
          </div>
        )}

        {/* Debug Mode */}
        {storeSettings.debugMode && (
          <div className="debug-info">
            <pre>{JSON.stringify(gamepadState, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}