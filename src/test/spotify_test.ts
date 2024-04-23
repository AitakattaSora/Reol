import { getSimilarTracks } from '../external/spotify/getSimilarTracks';
import { getTrackDetails } from '../external/spotify/getTrackDetails';
import { findUnplayedTrack } from '../external/spotify/utils/findUnplayedTrack';
import { getSpotifyTrackTitle } from '../external/spotify/utils/getSpotifyTrackTitle';
import { SPOTIFY_TRACK_REGEX } from '../utils/helpers';
import { getYoutubeTrackByQuery } from '../utils/youtube/getYoutubeTrack';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  try {
    const url = process.argv[2];
    if (!url) throw new Error('Please provide a Spotify track URL');

    const id = url.match(SPOTIFY_TRACK_REGEX)?.[1];
    if (!id) throw new Error('Invalid Spotify track URL');

    const playedTracks = [];
    let currentId = id;

    const trackDetails: any = await getTrackDetails(id);
    if (!trackDetails) throw new Error(`No track details found for ${id}`);

    const youtubeTrack = await getYoutubeTrackByQuery(
      `${trackDetails.artists[0].name} - ${trackDetails.name}`
    );

    playedTracks.push({
      spotifyId: currentId,
      youtubeUrl: youtubeTrack.url,
      title: getSpotifyTrackTitle(trackDetails),
    });

    while (playedTracks.length < 5) {
      const spotifyTracks = await getSimilarTracks(currentId, playedTracks);
      const unplayedTrack = await findUnplayedTrack(
        spotifyTracks,
        playedTracks
      );

      await delay(2000);

      if (!unplayedTrack) throw new Error('No unplayed track found');

      playedTracks.push({
        spotifyId: unplayedTrack.metadata?.spotifyTrackId || '',
        youtubeUrl: unplayedTrack.url,
        title: unplayedTrack.metadata?.title || '',
      });
      const spotifyTrackId = unplayedTrack.metadata?.spotifyTrackId;
      if (!spotifyTrackId) throw new Error('No Spotify track ID found');

      currentId = spotifyTrackId;
    }

    for (const track of playedTracks) {
      console.log(
        `https://open.spotify.com/track/${track.spotifyId}: ${track.title} - ${track.youtubeUrl}`
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
