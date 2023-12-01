import { AppDataSource } from '..';
import { SongRequest } from '../entities/SongRequest';

export async function saveSongRequest(
  url: string,
  title: string,
  authorId: string
) {
  await AppDataSource.manager.save(SongRequest, {
    url,
    title,
    requestedBy: authorId,
  });
}
