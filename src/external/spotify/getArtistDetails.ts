import { createAxiosClient } from './spotifyAxiosClient';

export async function getArtistDetails(artistId: string) {
  try {
    const axiosClient = await createAxiosClient();

    const response = await axiosClient.get(`/artists/${artistId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch track details:', error);
    return null;
  }
}
