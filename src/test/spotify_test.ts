import { getSimilarTracks } from '../external/spotify/getSimilarTracks';

async function main() {
  try {
    const query = process.argv[2];
    if (!query) throw new Error('Please provide query');

    const tracks = await getSimilarTracks(query);

    for (const track of tracks) {
      console.log(`- ${track.artist} - ${track.name}`);
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
