import { SpotifyTrack } from '../../external/spotify/getSimilarTracks';
import { getSpotifyTrackTitle } from '../../external/spotify/utils/getSpotifyTrackTitle';
import { getTrack } from '../getTrack';

export async function convertSpotifyToYoutube(track: SpotifyTrack) {
  const spotifyTrackTitle = getSpotifyTrackTitle(track);
  const youtubeTrack = await getTrack(`${spotifyTrackTitle} lyrics`);

  return youtubeTrack;
}
