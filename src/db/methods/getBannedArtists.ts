import { AppDataSource } from '..';
import { BannedArtist } from '../entities/BannedArtist';

export async function getBannedArtists() {
  const artists = await AppDataSource.manager.find(BannedArtist);
  return artists || [];
}
