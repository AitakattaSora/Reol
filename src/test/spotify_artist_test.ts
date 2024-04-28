import { getArtistDetails } from '../external/spotify/getArtistDetails';
import { getTrackDetails } from '../external/spotify/getTrackDetails';
import { getTrackFeatures } from '../external/spotify/getTrackFeatures';

async function main() {
  try {
    const artist = await getArtistDetails('6FQqZYVfTNQ1pCqfkwVFEa');
    const trackDetails = await getTrackDetails('3f7OyfSoDbQC0LRDQiytPp');
    const trackFeatures = await getTrackFeatures('3f7OyfSoDbQC0LRDQiytPp');

    console.log({ artist, trackDetails, trackFeatures });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main().catch(console.error);
