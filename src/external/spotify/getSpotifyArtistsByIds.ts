import { SpotifyArtist } from './getArtistRelatedArtists';
import { spotifyFetch } from './spotifyAxiosClient';

export async function getSpotifyArtistsByIds(
  ids: string[]
): Promise<SpotifyArtist[]> {
  try {
    const artists = await spotifyFetch('/artists', {
      params: {
        ids: ids.join(','),
      },
    });
    return artists?.artists || [];
  } catch (error) {
    console.error('Failed to fetch track details:', error);
    throw error;
  }
}
