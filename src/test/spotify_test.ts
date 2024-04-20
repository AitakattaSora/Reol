import { getSimilarTrackById } from '../external/spotify/getSimilarTrack';
import { getTrackDetails } from '../external/spotify/getTrackDetails';
import { sessionTracks } from '../external/spotify/utils/sessionTracks';
import { SPOTIFY_TRACK_REGEX } from '../utils/helpers';

async function main() {
  try {
    const url = process.argv[2];
    if (!url) throw new Error('Please provide a Spotify track URL');

    const id = url.match(SPOTIFY_TRACK_REGEX)?.[1];
    if (!id) throw new Error('Invalid Spotify track URL');

    const tracks = [];
    let currentId = id;

    const trackDetails = await getTrackDetails(id);

    sessionTracks.push(trackDetails);

    while (tracks.length < 5) {
      const track = await getSimilarTrackById(currentId);
      tracks.push(track);

      sessionTracks.push(track);

      currentId = track.id;
    }

    console.log(
      `Seed track: https://open.spotify.com/track/${id}: [${trackDetails.popularity}] ${trackDetails.artists[0].name} - ${trackDetails.name}\n`
    );

    console.log(
      sessionTracks.map((st) => {
        return {
          id: st.id,
          title: st.name,
          popularity: st.popularity,
          releaseDate: st.album.release_date,
          releaseDatePrecision: st.album.release_date_precision,
        };
      })
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
    throw error;
  }
}

main().catch(console.error);
