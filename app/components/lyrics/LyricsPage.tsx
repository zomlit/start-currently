import { useUser } from "@clerk/tanstack-start";
import { useLyricsStore } from "@/store/lyricsStore";
import { LyricsDisplay } from "@/components/lyrics/LyricsDisplay";

export function LyricsPage() {
  const { user } = useUser();
  const { settings } = useLyricsStore();
  
  // Add your existing LyricsPage logic here
  // This should be similar to what you have in your current lyrics.index.tsx

  return (
    <div>
      <h1>Lyrics Page</h1>
      {/* Add your existing LyricsPage UI here */}
    </div>
  );
} 