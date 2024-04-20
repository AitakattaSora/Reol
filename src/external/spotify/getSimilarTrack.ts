import { isAxiosError } from 'axios';
import { getTrackDetails } from './getTrackDetails';
import { createAxiosClient } from './spotifyAxiosClient';
import { getSpotifyTrackTitle } from './utils/getSpotifyTrackTitle';
import { getTrackFeatures } from './getTrackFeatures';
import { getArtistDetails } from './getArtistDetails';
import { matchGenresWithSeeds } from './utils/matchGenresWithSeeds';
import { sessionTracks } from './utils/sessionTracks';

export async function getSimilarTrackById(
  id: string
): Promise<{ id: string; title: string; popularity: number }> {
  try {
    const trackFeatures = await getTrackFeatures(id);

    const trackDetails = await getTrackDetails(id);
    if (!trackDetails) throw new Error(`Failed to get track details for ${id}`);

    const axiosClient = await createAxiosClient();
    const response = await axiosClient.get(
      'https://api.spotify.com/v1/recommendations',
      {
        params: {
          seed_tracks: sessionTracks
            .map((st) => st.id)
            .slice(-5)
            .join(','),
          target_danceability: trackFeatures.danceability,
          target_energy: trackFeatures.energy,
          target_valence: trackFeatures.valence,
          target_tempo: trackFeatures.tempo,
          min_popularity: trackDetails.popularity - 10,
          max_popularity: trackDetails.popularity + 10,
        },
      }
    );

    const track = response.data.tracks.filter((t: any) => {
      return t.id != id && !sessionTracks.some((st: any) => st.id === t.id);
    })[0];
    if (!track) throw new Error('No track found');

    // for (const t of response.data.tracks) {
    //   console.log(
    //     `${t.id}: ${t.artists.map((a: any) => a.name).join(', ')} - ${t.name}`
    //   );
    // }

    return {
      ...track,
      title: getSpotifyTrackTitle(track),
    };
  } catch (error) {
    throw error;
  }
}
