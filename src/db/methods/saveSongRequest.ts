import { AppDataSource } from '..';
import { SongRequest } from '../entities/SongRequest';

export async function saveSongRequest({
  authorId,
  guildId,
  url,
  title,
}: {
  url: string;
  title: string;
  authorId: string;
  guildId: string;
}) {
  await AppDataSource.manager.save(SongRequest, {
    url,
    title,
    requestedBy: authorId,
    guildId,
  });
}
