import { AppDataSource } from '../db';
import { getSimilarTracks } from '../external/spotify/getSimilarTracks';
import { SPOTIFY_TRACK_REGEX } from '../utils/helpers';
import { getYoutubeTrackByQuery } from '../utils/youtube/getYoutubeTrack';

async function main() {
  try {
    await AppDataSource.initialize();

    const url = process.argv[2];
    if (!url) throw new Error('Please provide a Spotify track URL');

    const id = url.match(SPOTIFY_TRACK_REGEX)?.[1];
    if (!id) throw new Error('Invalid Spotify track URL');

    const tracks = await getSimilarTracks(id);
    const youtubePromises = tracks.map(async (track) => {
      const ytt = await getYoutubeTrackByQuery(track.title).catch(() => null);
      return {
        ...ytt,
        popularity: track.popularity,
      };
    });

    const youtubeTracks = (await Promise.all(youtubePromises)).filter(
      (video) => video !== null
    ) as any[];

    for (const track of youtubeTracks) {
      console.log(`- [${track.popularity}] ${track.title} - ${track.url}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main().catch(console.error);
