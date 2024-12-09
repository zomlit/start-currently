import React, { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useVisualizerStore } from "@/store/visualizerStore";
import { supabase } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { VisualizerPreview } from "./widget-settings/visualizer/VisualizerPreview";

export function PublicVisualizerPage() {
  const { username } = useParams({ from: "/$username/visualizer" });
  const { settings, setSettings } = useVisualizerStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings and subscribe to changes
  useEffect(() => {
    let mounted = true;

    async function loadUserAndSettings() {
      if (!username) return;
      try {
        // Get user_id first
        const { data: profileData, error: profileError } = await supabase
          .from("UserProfile")
          .select("user_id")
          .eq("username", username)
          .single();

        if (profileError) throw profileError;
        if (!profileData?.user_id) throw new Error("User not found");

        // Load initial settings
        const { data, error } = await supabase
          .from("VisualizerWidget")
          .select("visualizer_settings")
          .eq("user_id", profileData.user_id)
          .single();

        if (error) throw error;
        if (data?.visualizer_settings) {
          setSettings(data.visualizer_settings);
        }

        // Subscribe to settings changes
        const settingsChannel = supabase
          .channel(`visualizer-settings:${profileData.user_id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "VisualizerWidget",
              filter: `user_id=eq.${profileData.user_id}`,
            },
            (payload: any) => {
              if (mounted && payload.new?.visualizer_settings) {
                setSettings(payload.new.visualizer_settings);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(settingsChannel);
        };
      } catch (error) {
        console.error("Error loading settings:", error);
        if (mounted) {
          setError("Failed to load settings");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadUserAndSettings();
    return () => {
      mounted = false;
    };
  }, [username, setSettings]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <VisualizerPreview settings={settings} />
    </div>
  );
}
