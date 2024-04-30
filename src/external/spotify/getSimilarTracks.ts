import { TrackDetails, getTrackDetails } from './getTrackDetails';
import { getSpotifyTrackTitle } from './utils/getSpotifyTrackTitle';
import { getTrackFeatures } from './getTrackFeatures';
import { RadioSession } from '../../interfaces/Queue';
import { spotifyFetch } from './spotifyAxiosClient';

interface SpotifyTrack extends TrackDetails {
  title: string;
}

export async function getSimilarTracks(
  id: string,
  radioSession: RadioSession
): Promise<SpotifyTrack[]> {
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
      seed_tracks: radioSession.tracks
        .slice(-5)
        .reverse()
        .map((rt) => rt.spotifyId)
        .join(','),
    };

    const MIN_POPULARITY = 50;
    if (trackDetails.popularity - 10 > MIN_POPULARITY) {
      requestParams.min_popularity = trackDetails.popularity - 10;
    } else {
      requestParams.min_popularity = MIN_POPULARITY;
    }

    if (radioSession.tracks.length < 5) {
      requestParams.target_danceability = trackFeatures.danceability;
      requestParams.target_energy = trackFeatures.energy;
      requestParams.target_valence = trackFeatures.valence;
      requestParams.target_tempo = trackFeatures.tempo;
    }

    const data = await spotifyFetch('/recommendations', {
      params: requestParams,
    });

    const tracks = (data?.tracks || []).map((t: any) => ({
      id: t.id,
      title: getSpotifyTrackTitle(t),
    }));

    return tracks;
  } catch (error) {
    throw error;
  }
}
