import { TrackDetails, getTrackDetails } from './getTrackDetails';
import { createAxiosClient } from './spotifyAxiosClient';
import { getSpotifyTrackTitle } from './utils/getSpotifyTrackTitle';
import { getTrackFeatures } from './getTrackFeatures';

interface SpotifyTrack extends TrackDetails {
  title: string;
}

export async function getSimilarTrackById(
  id: string,
  sessionTracksIds: string[]
): Promise<SpotifyTrack | null> {
  try {
    const trackFeatures = await getTrackFeatures(id);
    if (!trackFeatures) {
      throw new Error(`Unable to get track features for ${id}`);
    }

    const trackDetails = await getTrackDetails(id);
    if (!trackDetails) {
      throw new Error(`Unable to get track details for ${id}`);
    }

    const spotifyClient = await createAxiosClient();
    const response = await spotifyClient.get('/recommendations', {
      params: {
        seed_tracks: sessionTracksIds.slice(-5).join(','),
        target_danceability: trackFeatures.danceability,
        target_energy: trackFeatures.energy,
        target_valence: trackFeatures.valence,
        target_tempo: trackFeatures.tempo,
        target_popularity: trackDetails.popularity,
      },
    });

    const tracks = response?.data?.tracks || [];
    const track = tracks.filter((t: TrackDetails) =>
      sessionTracksIds.some((stId) => stId !== t.id)
    )?.[0];

    if (!track) return null;

    return {
      ...track,
      title: getSpotifyTrackTitle(track),
    };
  } catch (error) {
    throw error;
  }
}
