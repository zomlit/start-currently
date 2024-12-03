// src/types/spotify.types.ts
export interface UserSpotifyData {
  id: string;
  s_client_id: string;
  s_client_secret: string;
  s_refresh_token: string;
  s_access_token: string;
  is_streaming: boolean;
}
export interface SpotifyTrackData {
  isPlaying: boolean;
  title: string | undefined;
  artist: string;
  songUrl: string | undefined;
  album: string | undefined;
  artwork: string | undefined;
  duration: number | undefined;
  elapsed: number;
  progress: number | undefined;
  id: string | undefined;
}
export interface TrackInfo {
  trackName: string;
  artistName: string;
  albumName: string;
}
