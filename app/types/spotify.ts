export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number;
  isPlaying: boolean;
  progress: number;
  songUrl: string;
  elapsed?: number;
}
