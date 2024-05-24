import { AppDataSource } from '../db';
import { BannedArtist } from '../db/entities/BannedArtist';
import { getArtistDetails } from '../external/spotify/getArtistDetails';

async function main() {
  try {
    await AppDataSource.initialize();

    const id = process.argv[2];
    if (!id) throw new Error('Prodive artist id');

    const artist = await getArtistDetails(id);
    if (!artist) {
      throw new Error(`Unable to get artist details for ${id}`);
    }

    const result = await AppDataSource.manager.insert(BannedArtist, {
      spotifyId: artist.id,
    });

    console.log(result);
  } catch (error) {
    throw error;
  }
}

main().catch(console.error);
