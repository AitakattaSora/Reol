import { AppDataSource } from '..';
import { SongRequest } from '../entities/SongRequest';

export async function getSongRequestsByGuild(guildId: string) {
  const requests = await AppDataSource.manager.find(SongRequest, {
    where: {
      guildId,
    },
  });

  return requests || [];
}
