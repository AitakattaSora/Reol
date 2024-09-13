import { spotifyFetch } from './spotifyAxiosClient';

interface TrackFeatures {
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
  loudness: number;
}

export async function getTrackFeatures(
  trackId: string
): Promise<TrackFeatures | null> {
  try {
    const features = await spotifyFetch(`/audio-features/${trackId}`);
    return features;
  } catch (error) {
    console.error('Failed to fetch track features:', error);
    return null;
  }
}
