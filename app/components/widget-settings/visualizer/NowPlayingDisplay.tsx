import { useDatabaseStore } from "@/store/supabaseCacheStore";
import type { SpotifyTrack } from "@/types/spotify";
import { formatTime } from "@/utils";

export function NowPlayingDisplay() {
  const nowPlayingData = useDatabaseStore(
    (state) => state.VisualizerWidget?.[0]
  );

  return (
    <div className="relative z-10">
      <h2 className="mb-2 flex items-center text-lg font-bold text-purple-400">
        <svg
          className="mr-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        Now Playing
      </h2>
      {(nowPlayingData?.track as SpotifyTrack) ? (
        <div className="space-y-4">
          {/* Track info display */}
          <div className="flex items-center space-x-4">
            {(nowPlayingData?.track as SpotifyTrack)?.albumArt && (
              <img
                src={(nowPlayingData?.track as SpotifyTrack).albumArt}
                alt="Album Art"
                className="h-20 w-20 rounded-md border-2 border-blue-400 shadow-md"
              />
            )}
            <div>
              <p className="text-2xl font-bold text-blue-300">
                {(nowPlayingData?.track as SpotifyTrack).title}
              </p>
              <p className="text-lg text-purple-200">
                {(nowPlayingData?.track as SpotifyTrack).artist}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-300">Waiting for track data...</p>
      )}
    </div>
  );
}
