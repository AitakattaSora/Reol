import { getBannedArtists } from '../../db/methods/getBannedArtists';
import { getSongRequestsByGuild } from '../../db/methods/getSongRequests';
import { removeTrackDuplicates } from '../../utils/removeArrayDuplicates';
import { getRecommendations } from '../misc/getRecommendations';
import { TrackDetails, getTrackDetails } from './getTrackDetails';
import { getSpotifyTrackTitle } from './utils/getSpotifyTrackTitle';

async function getNormalizedSongStats(guildId: string) {
  const requests = await getSongRequestsByGuild(guildId);

  const freqMap = new Map<string, number>();
  for (const r of requests) {
    const key = `${r.name}::${r.artist}`;
    freqMap.set(key, (freqMap.get(key) ?? 0) + 1);
  }

  return freqMap;
}

function scoreTrack(track: SpotifyTrack, freqMap: Map<string, number>): number {
  const title = track.name || '';
  const artistStr = track?.artists?.map((a) => a.name).join(', ') || '';
  const key = `${title}::${artistStr}`;

  return freqMap.get(key) ?? 0;
}

export interface SpotifyTrack extends TrackDetails {
  title: string;
}

export async function getSimilarTracks(
  id: string,
  guildId: string
): Promise<SpotifyTrack[]> {
  try {
    const trackDetails = await getTrackDetails(id);
    if (!trackDetails) throw new Error(`Unable to get track details for ${id}`);

    const recommendations = await getRecommendations({
      seedTrackId: id,
      popularity: trackDetails.popularity,
      limit: 100,
    });

    const bannedArtists = await getBannedArtists();
    const freqMap = await getNormalizedSongStats(guildId);

    const tracks = recommendations
      .filter((t: any) => {
        const artists = (t?.artists || []).map((a: any) => a.id);
        return !bannedArtists.find((b) => artists.includes(b.spotifyId));
      })
      .map((t) => ({
        id: t.id,
        title: getSpotifyTrackTitle(t),
        artist: t.artists?.[0]?.name ?? '',
        popularity: t.popularity,
        artists: t.artists,
        name: t.name,
      })) as SpotifyTrack[];

    const withSeed: SpotifyTrack[] = [
      {
        id: trackDetails.id,
        title: getSpotifyTrackTitle(trackDetails),
        artists: trackDetails.artists,
        popularity: trackDetails.popularity,
        name: trackDetails.name,
      },
      ...tracks.sort((a, b) => scoreTrack(b, freqMap) - scoreTrack(a, freqMap)),
    ];

    const uniqueTracks = removeTrackDuplicates(withSeed);
    return uniqueTracks.slice(0, 30);
  } catch (error) {
    throw error;
  }
}
