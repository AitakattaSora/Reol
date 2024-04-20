import { createAxiosClient } from './spotifyAxiosClient';

export async function getTrackFeatures(trackId: string) {
  try {
    const axiosClient = await createAxiosClient();
    const response = await axiosClient(`/audio-features/${trackId}`);

    return response.data;
  } catch (error) {
    console.error('Failed to fetch track features:', error);
    return null;
  }
}
