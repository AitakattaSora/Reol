import { DataSource } from 'typeorm';
import { SongRequest } from './entities/SongRequest';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'db/db.sqlite',
  entities: [SongRequest],
  synchronize: true,
});
