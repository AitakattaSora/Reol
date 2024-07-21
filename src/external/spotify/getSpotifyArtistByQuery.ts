import { SpotifyArtist } from './getArtistRelatedArtists';
import { spotifyFetch } from './spotifyAxiosClient';

export async function getSpotifyArtistByQuery(
  query: string
): Promise<SpotifyArtist | null> {
  try {
    const results = await spotifyFetch('search', {
      params: {
        q: query,
        type: 'artist',
      },
    });

    const artist = results?.artists?.items?.[0];
    return artist || null;
  } catch (error) {
    console.error('Failed to fetch track details:', error);
    return null;
  }
}
