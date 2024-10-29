export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  isPlaying: boolean;
  elapsed: number;
  duration: number;
  lyrics?: string;
}

export interface VisualizerData {
  track: SpotifyTrack;
}
