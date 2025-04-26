import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class SongRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  title: string;

  // song name
  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  artist?: string;

  @Column()
  requestedBy: string;

  @Column()
  guildId: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;
}
