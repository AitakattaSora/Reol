import { getSpotifyTrackByQuery } from '../../external/spotify/getSpotifyTrackByQuery';
import { SPOTIFY_TRACK_REGEX, isYoutubeURL } from '../helpers';
import { cleanYoutubeTitle } from '../youtube/cleanYoutubeTitle';
import { getYoutubeTrackByURL } from '../youtube/getYoutubeTrack';

/**
 * Get spotify track id from query
 * @param query - Spotify track id, youtube video url or track name
 * @returns Spotify track id
 */
export async function getSpotifyTrackId(query: string): Promise<string | null> {
  if (SPOTIFY_TRACK_REGEX.test(query)) {
    return query.match(SPOTIFY_TRACK_REGEX)?.[1] || null;
  } else if (isYoutubeURL(query)) {
    const youtubeVideo = await getYoutubeTrackByURL(query);
    const spotifyTrack = await getSpotifyTrackByQuery(
      cleanYoutubeTitle(youtubeVideo.title)
    );

    return spotifyTrack?.id || null;
  } else {
    const spotifyTrack = await getSpotifyTrackByQuery(query);
    return spotifyTrack?.id || null;
  }
}
