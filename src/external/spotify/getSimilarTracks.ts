import { LastFmTrack } from '../lastfm/findTrackByQuery';
import { getSimilarLastFmTracks } from '../lastfm/getSimilarLastFmTracks';
import { TrackDetails } from './getTrackDetails';

export interface SpotifyTrack extends TrackDetails {
  title: string;
}

export async function getSimilarTracks(id: string): Promise<LastFmTrack[]> {
  try {
    const tracks = await getSimilarLastFmTracks(id);

    return tracks;
  } catch (error) {
    throw error;
  }
}
