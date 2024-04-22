import { createAxiosClient } from './spotifyAxiosClient';

export interface TrackDetails {
  id: string;
  popularity: number;
}

export async function getTrackDetails(
  trackId: string
): Promise<TrackDetails | null> {
  try {
    const axiosClient = await createAxiosClient();

    const response = await axiosClient.get(`/tracks/${trackId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch track details:', error);
    return null;
  }
}
