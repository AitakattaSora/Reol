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
    // const artist = await getArtistDetails(trackDetails.artists[0].id);

    // spotify supports up to 5 seeds (seed_artists + seed_genres + seed_tracks <= 5)
    // so 1 seed track + 2 seed artists + 2 seed genres = 5 seeds
    const seedArtist = trackDetails.artists[0].id;
    // const seedGenre = matchGenresWithSeeds(artist.genres)?.[0];

    const axiosClient = await createAxiosClient();
    const response = await axiosClient.get(
      'https://api.spotify.com/v1/recommendations',
      {
        params: {
          seed_tracks: id,
          seed_artists: seedArtist,
          min_danceability: trackFeatures.danceability - 0.1,
          max_danceability: trackFeatures.danceability + 0.1,
          min_energy: trackFeatures.energy - 0.1,
          max_energy: trackFeatures.energy + 0.1,
          min_valence: trackFeatures.valence - 0.1,
          max_valence: trackFeatures.valence + 0.1,
          min_tempo: trackFeatures.tempo - 30,
          max_tempo: trackFeatures.tempo + 30,
          // min_popularity: trackDetails.popularity - 10,
          // max_popularity: trackDetails.popularity + 10,
          // min_speechiness: trackFeatures.speechiness - 0.1,
          // max_speechiness: trackFeatures.speechiness + 0.1,
          // min_acousticness: trackFeatures.acousticness - 0.1,
          // max_acousticness: trackFeatures.acousticness + 0.1,
          // min_instrumentalness: trackFeatures.instrumentalness - 0.1,
          // max_instrumentalness: trackFeatures.instrumentalness + 0.1,
          // min_liveness: trackFeatures.liveness - 0.1,
          // max_liveness: trackFeatures.liveness + 0.1,
          // min_mode: trackFeatures.mode,
          // max_mode: trackFeatures.mode,
          // min_key: trackFeatures.key,
          // max_key: trackFeatures.key,
          // min_time_signature: trackFeatures.time_signature,
          // max_time_signature: trackFeatures.time_signature,
          // limit: 20,
        },
      }
    );

    const track = response.data.tracks.filter((t: any) => {
      return t.id != id && !sessionTracks.includes(t.id);
    })[0];
    if (!track) throw new Error('No track found');

    // for (const t of response.data.tracks) {
    //   console.log(
    //     `${t.id}: ${t.artists.map((a: any) => a.name).join(', ')} - ${t.name}`
    //   );
    // }

    return {
      id: track.id,
      title: getSpotifyTrackTitle(track),
      popularity: track.popularity,
    };
  } catch (error) {
    throw error;
  }
}
