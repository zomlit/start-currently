import React, { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { supabase } from "@/utils/supabase/client";
import { OverlayStore, WidgetNode } from "@/types/overlay";
import { WidgetContent } from "@/components/overlay/nodes/WidgetContent";
import type { Database } from "@/types/supabase";

type Overlay = Database["public"]["Tables"]["overlays"]["Row"];
type UserProfile = Database["public"]["Tables"]["UserProfile"]["Row"];

export function PublicOverlayView() {
  const params = useParams({ from: "/$username/overlay" });
  const [overlayData, setOverlayData] = useState<Overlay | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.username) return;

    const fetchOverlayData = async () => {
      try {
        // First get the user's profile
        const { data: userProfile, error: userError } = await supabase
          .from("UserProfile")
          .select("user_id")
          .eq("username", params.username)
          .single();

        if (userError) throw userError;
        if (!userProfile) throw new Error("User not found");

        // Then get their overlay data
        const { data: overlayData, error: overlayError } = await supabase
          .from("overlays")
          .select("*")
          .eq("user_id", userProfile.user_id)
          .single();

        if (overlayError) throw overlayError;
        if (!overlayData) throw new Error("Overlay not found");

        setOverlayData(overlayData);
      } catch (err) {
        console.error("Error fetching overlay:", err);
        setError(err instanceof Error ? err.message : "Failed to load overlay");
      }
    };

    fetchOverlayData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`public:overlays:${params.username}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "overlays",
          filter: `user_id=eq.${params.username}`,
        },
        (payload) => {
          setOverlayData(payload.new as Overlay);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.username]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!overlayData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        backgroundColor: overlayData.settings?.background as string,
      }}
    >
      {(overlayData.nodes as WidgetNode[])?.map((node) => (
        <div
          key={node.id}
          className="absolute"
          style={{
            left: node.position.x,
            top: node.position.y,
            width: node.width || "auto",
            height: node.height || "auto",
          }}
        >
          <WidgetContent type={node.data.type} selected={false} />
        </div>
      ))}
    </div>
  );
}
