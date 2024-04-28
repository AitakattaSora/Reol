import { spotifyFetch } from './spotifyAxiosClient';

export async function getArtistDetails(artistId: string) {
  try {
    const artist = await spotifyFetch(`/artists/${artistId}`);
    return artist;
  } catch (error) {
    console.error('Failed to fetch track details:', error);
    return null;
  }
}
