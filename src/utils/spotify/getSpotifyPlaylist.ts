import retry from 'async-retry';
import { getYoutubeTrackByQuery } from '../youtube/getYoutubeTrack';
import { Playlist } from '../getPlaylist';
import fetch from 'isomorphic-unfetch';
const { getTracks } = require('spotify-url-info')(fetch);

export async function getSpotifyPlaylist(url: string): Promise<Playlist> {
  return retry(
    async () => {
      try {
        const results = (await getTracks(url)) as {
          artist: string;
          name: string;
        }[];

        const tracks = await Promise.all(
          results.map(async (track: any) => {
            const artist = track?.artist || '';
            const title = track?.name || '';

            return getYoutubeTrackByQuery(`${artist} - ${title}`);
          })
        );

        return {
          title: 'Spotify Playlist',
          url,
          tracks,
        };
      } catch (error) {
        throw error;
      }
    },
    {
      retries: 2,
    }
  );
}
