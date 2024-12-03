import { useEffect } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";

export default function useSupabaseSubscription(channel: RealtimeChannel) {
  useEffect(() => {
    channel.subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [channel]);
}
