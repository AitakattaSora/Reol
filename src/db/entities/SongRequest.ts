import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SongRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  title: string;

  @Column({ default: 1 })
  requestCount: number;
}
