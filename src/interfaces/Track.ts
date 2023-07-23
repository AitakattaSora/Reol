export interface Track {
  url: string;
  title: string;
  durationFormatted: string;
  durationSec: number;
  metadata?: TrackMetadata;
}

export interface TrackMetadata {
  artist: string;
  title: string;
}
