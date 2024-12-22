import { LastFmTrack, findTrackByQuery } from './findTrackByQuery';
import { lastFmFetch } from './lastFmAxiosClient';

export async function getSimilarLastFmTracks(
  query: string
): Promise<LastFmTrack[]> {
  try {
    const track = await findTrackByQuery(query);
    if (!track) {
      throw new Error('Track not found');
    }

    const res = await lastFmFetch('track.getSimilar', {
      params: {
        track: track.name,
        artist: track.artist,
        limit: 20,
      },
    });

    const tracks = res?.similartracks?.track || [];

    return tracks.map((track: any) => ({
      name: track.name,
      artist: track.artist.name,
    }));
  } catch (error) {
    console.error('Error occurred while fetching track by query', error);
    throw error;
  }
}
