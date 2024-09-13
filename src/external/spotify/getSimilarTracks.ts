import { TrackDetails, getTrackDetails } from './getTrackDetails';
import { getSpotifyTrackTitle } from './utils/getSpotifyTrackTitle';
import { getTrackFeatures } from './getTrackFeatures';
import { spotifyFetch } from './spotifyAxiosClient';
import { removeTrackDuplicates } from '../../utils/removeArrayDuplicates';
import { getBannedArtists } from '../../db/methods/getBannedArtists';

export interface SpotifyTrack extends TrackDetails {
  title: string;
}

export async function getSimilarTracks(id: string): Promise<SpotifyTrack[]> {
  try {
    const trackFeatures = await getTrackFeatures(id);
    if (!trackFeatures) {
      throw new Error(`Unable to get track features for ${id}`);
    }

    const trackDetails = await getTrackDetails(id);
    if (!trackDetails) {
      throw new Error(`Unable to get track details for ${id}`);
    }

    const requestParams: Record<string, string | number> = {
      seed_tracks: id,
      target_danceability: trackFeatures.danceability,
      target_energy: trackFeatures.energy,
      target_valence: trackFeatures.valence,
      target_tempo: trackFeatures.tempo,
      target_loudness: trackFeatures.loudness,
      min_popularity: trackDetails.popularity - 10,
      limit: 60,
    };

    const data = await spotifyFetch('/recommendations', {
      params: requestParams,
    });

    const bannedArtists = await getBannedArtists();
    const tracks = (data?.tracks || [])
      .filter((t: any) => {
        const artists = (t?.artists || []).map((a: any) => a.id);

        return !bannedArtists.find((b) => artists.includes(b.spotifyId));
      })
      .map((t: any) => ({
        id: t.id,
        title: getSpotifyTrackTitle(t),
        popularity: t.popularity,
      }));
    // .sort((a: SpotifyTrack, b: SpotifyTrack) => b.popularity - a.popularity);

    const uniqueTracks: SpotifyTrack[] = removeTrackDuplicates([
      {
        id: id,
        title: getSpotifyTrackTitle(trackDetails),
        popularity: trackDetails.popularity,
      },
      ...tracks,
    ]);

    return uniqueTracks.slice(0, 30);
  } catch (error) {
    throw error;
  }
}
