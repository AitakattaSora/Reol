import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BannedArtist {
  @PrimaryColumn({ unique: true })
  spotifyId: string;
}
