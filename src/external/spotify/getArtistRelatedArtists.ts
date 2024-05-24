import { spotifyFetch } from './spotifyAxiosClient';

export interface SpotifyArtist {
  id: string;
  name: string;
}

export async function getArtistRelatedArtists(
  artistId: string
): Promise<SpotifyArtist[]> {
  try {
    const artists = await spotifyFetch(`/artists/${artistId}/related-artists`);
    return artists?.artists || [];
  } catch (error) {
    console.error('Failed to fetch track details:', error);
    throw error;
  }
}
