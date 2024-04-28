import retry from 'async-retry';
import { Track } from '../../interfaces/Track';
import { getYoutubeTrackByQuery } from '../youtube/getYoutubeTrack';
import { SPOTIFY_TRACK_REGEX } from '../helpers';
import { getTrackDetails } from '../../external/spotify/getTrackDetails';

export async function getSpotifyTrack(url: string): Promise<Track> {
  return retry(async () => {
    try {
      const data = await getTrackDetails(url);

      const artist = data?.artist || '';
      const title = data?.title || '';

      const track = await getYoutubeTrackByQuery(`${artist} - ${title}`);

      return {
        ...track,
        metadata: {
          artist: artist,
          title: title,
          spotifyTrackId: url.match(SPOTIFY_TRACK_REGEX)?.[1],
        },
      };
    } catch (error) {
      throw error;
    }
  });
}
