export class NoLyricsAvailableError extends Error {
  constructor(trackId: string, artist: string) {
    super(`No lyrics available for track: ${artist} - ${trackId}`);
    this.name = "NoLyricsAvailableError";
  }
}
