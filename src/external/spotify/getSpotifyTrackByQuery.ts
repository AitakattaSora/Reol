import { TrackDetails } from './getTrackDetails';
import { spotifyFetch } from './spotifyAxiosClient';

export async function getSpotifyTrackByQuery(
  query: string
): Promise<TrackDetails | null> {
  try {
    const tracks = await spotifyFetch('/search', {
      params: {
        type: 'track',
        q: query,
      },
    });

    const track = tracks?.tracks?.items?.[0] || null;
    return track;
  } catch (error) {
    console.error('Failed to fetch track details:', error);
    throw error;
  }
}
