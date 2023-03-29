import retry from 'async-retry';
import { Track } from '../../interfaces/Queue';
import { getYoutubeTrackByQuery } from '../youtube/getYoutubeTrack';
import fetch from 'isomorphic-unfetch';
const { getPreview } = require('spotify-url-info')(fetch);

export async function getSpotifyTrack(url: string): Promise<Track> {
  return retry(async () => {
    try {
      const data = await getPreview(url);

      const artist = data?.artist || '';
      const title = data?.title || '';

      const track = await getYoutubeTrackByQuery(`${artist} - ${title}`);
      return track;
    } catch (error) {
      throw error;
    }
  });
}
