import React, { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/store/themeStore";
import { OptimisticProfileSettingsProvider } from "@/contexts/OptimisticProfileSettingsContext";
import { AuthWrapper } from "@/components/AuthWrapper";
import { ElysiaSessionProvider } from "@/contexts/ElysiaSessionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@clerk/tanstack-start";
import { Toaster } from "sonner";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { supabase } from "@/utils/supabase/client";

const queryClient = new QueryClient();

export const Route = createFileRoute("/_lyrics")({
  component: LyricsComponent,
});

function LyricsComponent() {
  const { theme } = useThemeStore();
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();

  // Set up Supabase subscription at the layout level
  useEffect(() => {
    if (!userId) return;

    console.log("Setting up Supabase subscription in _lyrics layout:", userId);
    const channel = supabase
      .channel(`public:VisualizerWidget:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "VisualizerWidget",
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          console.log("Supabase payload in _lyrics layout:", payload);
          const { new: newData } = payload;
          if (newData?.track) {
            const trackData =
              typeof newData.track === "string"
                ? JSON.parse(newData.track)
                : newData.track;
            console.log("Track data received in _lyrics layout:", trackData);
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up Supabase subscription in _lyrics layout");
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (isLoaded && !userId) {
      navigate({ to: "/sign-in/$" });
    }
  }, [isLoaded, userId, navigate]);

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme="system">
        <QueryClientProvider client={queryClient}>
          <AuthWrapper>
            <ElysiaSessionProvider broadcastChannel="your-broadcast-channel">
              <div style={{ height: "100vh", overflow: "hidden" }}>
                <Outlet />
              </div>
              <Toaster theme={theme === "system" ? undefined : theme} />
            </ElysiaSessionProvider>
          </AuthWrapper>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
