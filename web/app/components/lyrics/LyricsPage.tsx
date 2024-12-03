import React from "react";
import { useUser } from "@clerk/tanstack-start";
import { useLyricsStore } from "@/store/lyricsStore";
import { LyricsDisplay } from "./LyricsDisplay";

export function LyricsPage() {
  const { user } = useUser();
  const { settings } = useLyricsStore();
  
  return (
    <div>
      <h1>Lyrics Page</h1>
      {/* Add your existing LyricsPage UI here */}
    </div>
  );
}

export default LyricsPage; 