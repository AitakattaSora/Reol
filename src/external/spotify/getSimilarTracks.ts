import { TrackDetails, getTrackDetails } from './getTrackDetails';
import { getSpotifyTrackTitle } from './utils/getSpotifyTrackTitle';
import { getTrackFeatures } from './getTrackFeatures';
import { spotifyFetch } from './spotifyAxiosClient';
import { getArtistRelatedArtists } from './getArtistRelatedArtists';
import { removeTrackDuplicates } from '../../utils/removeArrayDuplicates';

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

    const relatedArtists = await getArtistRelatedArtists(
      trackDetails.artists[0].id
    );

    const artistsSeed = relatedArtists
      .map((a) => a.id)
      .slice(0, 4)
      .join(',');

    const requestParams: Record<string, string | number> = {
      seed_tracks: id,
      seed_artists: artistsSeed,
      target_danceability: trackFeatures.danceability,
      target_energy: trackFeatures.energy,
      target_valence: trackFeatures.valence,
      target_tempo: trackFeatures.tempo,
      min_popularity: trackDetails.popularity - 10,
      limit: 70,
    };

    const data = await spotifyFetch('/recommendations', {
      params: requestParams,
    });

    const tracks = (data?.tracks || []).map((t: any) => ({
      id: t.id,
      title: getSpotifyTrackTitle(t),
      artistId: t.artists[0].id,
    }));

    const uniqueTracks: SpotifyTrack[] = removeTrackDuplicates([
      {
        id: id,
        title: getSpotifyTrackTitle(trackDetails),
      },
      ...tracks,
    ]);

    return uniqueTracks;
  } catch (error) {
    throw error;
  }
}
