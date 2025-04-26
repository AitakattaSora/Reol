import { DataSource } from 'typeorm';
import { SongRequest } from './entities/SongRequest';
import { BannedArtist } from './entities/BannedArtist';
import appRootPath from 'app-root-path';
import { ENV } from '../utils/ENV';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: `${appRootPath}/src/db/db.sqlite`,
  entities: [SongRequest, BannedArtist],
  synchronize: !ENV.IS_PROD,
});
