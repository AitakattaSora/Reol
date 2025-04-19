import { getBannedArtists } from '../../db/methods/getBannedArtists';
import { removeTrackDuplicates } from '../../utils/removeArrayDuplicates';
import { getRecommendations } from '../misc/getRecommendations';
import { TrackDetails, getTrackDetails } from './getTrackDetails';
import { getSpotifyTrackTitle } from './utils/getSpotifyTrackTitle';

export interface SpotifyTrack extends TrackDetails {
  title: string;
}

export async function getSimilarTracks(id: string): Promise<SpotifyTrack[]> {
  try {
    const trackDetails = await getTrackDetails(id);
    if (!trackDetails) {
      throw new Error(`Unable to get track details fro ${id}`);
    }

    const recommendations = await getRecommendations({
      seedTrackId: id,
      limit: 50,
    });

    const bannedArtists = await getBannedArtists();
    const tracks = recommendations
      .filter((t: any) => {
        const artists = (t?.artists || []).map((a: any) => a.id);

        return !bannedArtists.find((b) => artists.includes(b.spotifyId));
      })
      .map((t: any) => ({
        id: t.id,
        title: getSpotifyTrackTitle(t),
        popularity: t.popularity,
      })) as SpotifyTrack[];

    const uniqueTracks = removeTrackDuplicates([
      {
        ...trackDetails,
        title: getSpotifyTrackTitle(trackDetails),
      },
      ...tracks,
    ]);

    return uniqueTracks.slice(0, 30);
  } catch (error) {
    throw error;
  }
}
