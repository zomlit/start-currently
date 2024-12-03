export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number;
  elapsed?: number;
  progress?: number;
  isPlaying: boolean;
  songUrl: string;
  bars?: any;
  beats?: any;
  sections?: any;
  tempo?: number;
  time_signature?: number;
}
