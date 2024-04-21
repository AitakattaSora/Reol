import retry from 'async-retry';
import { Track } from '../../interfaces/Track';
import { getYoutubeTrackByQuery } from '../youtube/getYoutubeTrack';
import fetch from 'isomorphic-unfetch';
import { SPOTIFY_TRACK_REGEX } from '../helpers';
const { getPreview } = require('spotify-url-info')(fetch);

export async function getSpotifyTrack(url: string): Promise<Track> {
  return retry(async () => {
    try {
      const data = await getPreview(url);

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
