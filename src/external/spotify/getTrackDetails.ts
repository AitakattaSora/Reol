import { createAxiosClient } from './spotifyAxiosClient';

export async function getTrackDetails(trackId: string) {
  try {
    const axiosClient = await createAxiosClient();

    const response = await axiosClient.get(`/tracks/${trackId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch track details:', error);
    return null;
  }
}
