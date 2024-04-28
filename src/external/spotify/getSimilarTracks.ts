import { TrackDetails, getTrackDetails } from './getTrackDetails';
import { getSpotifyTrackTitle } from './utils/getSpotifyTrackTitle';
import { getTrackFeatures } from './getTrackFeatures';
import { RadioSessionTrack } from '../../interfaces/Queue';
import { spotifyFetch } from './spotifyAxiosClient';

interface SpotifyTrack extends TrackDetails {
  title: string;
}

export async function getSimilarTracks(
  id: string,
  radioSessionTrack: RadioSessionTrack[]
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

    const data = await spotifyFetch('/recommendations', {
      params: {
        seed_tracks: radioSessionTrack
          .slice(-5)
          .map((rt) => rt.spotifyId)
          .join(','),
        target_danceability: trackFeatures.danceability,
        target_energy: trackFeatures.energy,
        target_valence: trackFeatures.valence,
        target_tempo: trackFeatures.tempo,
        ...(trackDetails.popularity > 50
          ? { target_popularity: trackDetails.popularity }
          : { min_popularity: 50 }),
      },
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
