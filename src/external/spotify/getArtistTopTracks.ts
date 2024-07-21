import { TrackDetails } from './getTrackDetails';
import { spotifyFetch } from './spotifyAxiosClient';

export async function getArtistTopTracks(
  artistId: string
): Promise<TrackDetails[]> {
  try {
    const res = await spotifyFetch(`/artists/${artistId}/top-tracks`);
    return (res?.tracks || []).slice(0, 20);
  } catch (error) {
    console.error('Failed to get artists top tracks', error);
    return [];
  }
}
