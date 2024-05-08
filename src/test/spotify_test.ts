import { AppDataSource } from '../db';
import { getSimilarTracks } from '../external/spotify/getSimilarTracks';
import { Track } from '../interfaces/Track';
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
    tracks.length = 20;

    const youtubeTracks: Track[] = [];
    for (const track of tracks) {
      try {
        const youtubeTrack = await getYoutubeTrackByQuery(
          track.title + ' lyrics'
        );
        if (youtubeTrack) {
          youtubeTracks.push({
            ...youtubeTrack,
            metadata: {
              ...youtubeTrack.metadata,
              spotifyTrackId: track.id,
            },
          });
        }
      } catch (error) {}
    }

    for (const track of youtubeTracks) {
      console.log(
        `- https://open.spotify.com/track/${track.metadata?.spotifyTrackId}: ${track.title} - ${track?.url}`
      );
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
