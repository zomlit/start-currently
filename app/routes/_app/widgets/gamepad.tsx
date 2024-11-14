import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth, useUser } from '@clerk/tanstack-start'
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
import { useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";

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

export function GamepadSection() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { data: profiles, isLoading: isProfilesLoading } = useProfiles('gamepad');
  const { data: profile, isLoading: isProfileLoading } = useProfile('gamepad', user?.id ?? null);

  const publicUrl = `${import.meta.env.VITE_PUBLIC_APP_URL}/${user?.id}/gamepad`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success({
      title: "Success",
      description: "URL copied to clipboard"
    });
  };

  // Add broadcast function using Supabase Realtime
  const broadcastGamepadState = useCallback(async (gamepadState: any) => {
    if (!user?.username) return;

    try {
      const channel = supabase.channel(`gamepad:${user.username}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user.username },
        },
      });

      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: 'gamepadState',
            payload: { gamepadState }
          });
        }
      });

      // Clean up channel after broadcast
      await supabase.removeChannel(channel);
    } catch (error) {
      console.error('Error broadcasting gamepad state:', error);
    }
  }, [user?.username]);

  // Add effect to broadcast gamepad changes
  useEffect(() => {
    if (!user?.username) return;

    const handleGamepadInput = (e: GamepadEvent) => {
      const gamepad = e.gamepad;
      if (gamepad) {
        broadcastGamepadState({
          buttons: gamepad.buttons.map(b => b.pressed),
          axes: gamepad.axes
        });
      }
    };

    window.addEventListener('gamepadconnected', handleGamepadInput);
    window.addEventListener('gamepaddisconnected', handleGamepadInput);

    // Poll for gamepad state
    const interval = setInterval(() => {
      const gamepads = navigator.getGamepads();
      const activeGamepad = gamepads[0];
      if (activeGamepad) {
        broadcastGamepadState({
          buttons: activeGamepad.buttons.map(b => b.pressed),
          axes: activeGamepad.axes
        });
      }
    }, 16); // 60fps

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadInput);
      window.removeEventListener('gamepaddisconnected', handleGamepadInput);
      clearInterval(interval);
    };
  }, [user?.username, broadcastGamepadState]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-background">
          <GamepadViewer 
            settings={profile?.settings?.specificSettings || defaultSettings} 
            username={user?.id}
          />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_app/widgets/gamepad')({
  component: GamepadSection
}) 