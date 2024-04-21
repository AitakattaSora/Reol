import { getSimilarTrackById } from '../external/spotify/getSimilarTrack';
import { getTrackDetails } from '../external/spotify/getTrackDetails';
import { SPOTIFY_TRACK_REGEX } from '../utils/helpers';

async function main() {
  try {
    const url = process.argv[2];
    if (!url) throw new Error('Please provide a Spotify track URL');

    const id = url.match(SPOTIFY_TRACK_REGEX)?.[1];
    if (!id) throw new Error('Invalid Spotify track URL');

    const tracks = [];
    let currentId = id;

    const trackDetails: any = await getTrackDetails(id);
    if (!trackDetails) throw new Error(`No track details found for ${id}`);

    while (tracks.length < 1) {
      const track = await getSimilarTrackById(currentId, [currentId]);
      if (!track) throw new Error(`No similar track found for ${currentId}`);

      tracks.push(track);

      currentId = track.id;
    }

    console.log(
      `Seed track: https://open.spotify.com/track/${id}: [${trackDetails.popularity}] ${trackDetails.artists[0].name} - ${trackDetails.name}\n`
    );

    console.log(
      tracks
        .map(
          (t, idx) =>
            `${idx + 1}. https://open.spotify.com/track/${t.id}: [${
              t.popularity
            }] ${t.title}`
        )
        .join('\n')
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main().catch(console.error);
