import { createAxiosClient } from './spotifyAxiosClient';

interface TrackFeatures {
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
}

export async function getTrackFeatures(
  trackId: string
): Promise<TrackFeatures | null> {
  try {
    const axiosClient = await createAxiosClient();
    const response = await axiosClient(`/audio-features/${trackId}`);

    return response.data;
  } catch (error) {
    console.error('Failed to fetch track features:', error);
    return null;
  }
}
