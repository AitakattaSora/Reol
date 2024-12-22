import { lastFmFetch } from './lastFmAxiosClient';

export interface LastFmTrack {
  name: string;
  artist: string;
}

export async function findTrackByQuery(
  query: string
): Promise<LastFmTrack | null> {
  try {
    const res = await lastFmFetch('track.search', {
      params: {
        track: query,
        limit: 1,
      },
    });

    return res?.results?.trackmatches?.track?.[0] || null;
  } catch (error) {
    console.error('Error occurred while fetching track by query', error);
    return null;
  }
}
