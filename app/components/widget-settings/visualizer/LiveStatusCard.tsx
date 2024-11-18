import { useState, useEffect } from "react";
import { useAuth } from "@clerk/tanstack-start";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";
import type { TrackData } from "@/types/visualizer";

type TwitchUser = Database["public"]["Tables"]["TwitchUserCache"]["Row"];

export function LiveStatusCard() {
  const { getToken, userId } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(false);
  const [lastLive, setLastLive] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [twitchUser, setTwitchUser] = useState<TwitchUser | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch Twitch user data from cache
  useEffect(() => {
    const fetchTwitchUser = async () => {
      if (!userId) return;

      const { data: userProfile } = await supabase
        .from("UserProfile")
        .select("selectedUsername")
        .eq("user_id", userId)
        .single();

      if (!userProfile?.selectedUsername) return;

      const { data: twitchData, error } = await supabase
        .from("TwitchUserCache")
        .select("*")
        .eq("login", userProfile.selectedUsername.toLowerCase())
        .single();

      if (error) {
        console.error("Error fetching Twitch user:", error);
        return;
      }

      setTwitchUser(twitchData);
    };

    fetchTwitchUser();
  }, [userId]);

  // Check Twitch live status
  const checkLiveStatus = async () => {
    if (!twitchUser) return;

    try {
      const token = await getToken({ template: "lstio" });
      if (!token) return;

      const response = await fetch(
        `https://api.twitch.tv/helix/streams?user_login=${twitchUser.login}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const isCurrentlyLive = data.data.length > 0;
        setIsLive(isCurrentlyLive);

        if (!isCurrentlyLive && isLive) {
          setLastLive(new Date());
        }
      }
    } catch (error) {
      console.error("Error checking live status:", error);
    }
  };

  useEffect(() => {
    if (twitchUser) {
      checkLiveStatus();
      const interval = setInterval(checkLiveStatus, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [twitchUser]);

  const toggleLiveStatus = async () => {
    setIsLoading(true);
    try {
      const token = await getToken({ template: "lstio" });
      if (!token) return;

      // Update stream status in Supabase
      const { error } = await supabase.from("stream_sessions").insert([
        {
          user_id: userId,
          broadcaster_id: twitchUser?.id,
          start_time: new Date().toISOString(),
          is_live: !isLive,
        },
      ]);

      if (error) throw error;
      setIsLive(!isLive);
      if (!isLive) {
        setLastLive(new Date());
      }
    } catch (error) {
      console.error("Error toggling stream:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-300">
            {currentTime.toLocaleTimeString()}
          </h2>
          <p className="text-sm text-purple-500">
            {currentTime.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isLive ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className={isLive ? "text-green-400" : "text-red-400"}>
              {isLive ? "Live" : "Offline"}
            </span>
          </div>
          {twitchUser && (
            <p className="text-xs text-purple-500">
              {twitchUser.display_name}
              {twitchUser.broadcaster_type && (
                <span className="ml-1 text-blue-400">
                  ({twitchUser.broadcaster_type})
                </span>
              )}
            </p>
          )}
          {!isLive && lastLive && (
            <p className="text-xs text-gray-400">
              Last live: {formatDistanceToNow(lastLive)} ago
            </p>
          )}
        </div>
      </div>

      <Button
        className={`w-full ${
          isLive
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
        onClick={toggleLiveStatus}
        disabled={isLoading || !twitchUser}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isLive ? (
          "End Stream"
        ) : (
          "Go Live"
        )}
      </Button>
    </div>
  );
}
