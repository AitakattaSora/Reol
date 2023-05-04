import { AppDataSource } from '..';
import { SongRequest } from '../entities/SongRequest';

export async function createOrUpdateSongRequest(url: string, title: string) {
  const songRequest = await AppDataSource.manager.findOne(SongRequest, {
    where: {
      url,
    },
  });

  if (songRequest) {
    songRequest.requestCount += 1;
    await AppDataSource.manager.save(songRequest);
  } else {
    await AppDataSource.manager.save(SongRequest, {
      url,
      title,
    });
  }
}
