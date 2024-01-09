import retry from 'async-retry';
import { getYoutubeTrackByQuery } from '../youtube/getYoutubeTrack';
import { Playlist } from '../getPlaylist';
import fetch from 'isomorphic-unfetch';
import { Track } from '../../interfaces/Track';
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

            try {
              return await getYoutubeTrackByQuery(`${artist} - ${title}`);
            } catch (error) {
              console.error(
                `Error fetching track from YouTube: ${artist} - ${title}`,
                error
              );
              return null;
            }
          })
        );

        const successTracks = tracks.filter((track) => track) as Track[];
        return {
          title: 'Spotify Playlist',
          url,
          tracks: successTracks,
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
