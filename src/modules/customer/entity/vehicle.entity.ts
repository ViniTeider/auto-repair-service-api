import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('vehicle')
@Unique(['licensePlate'])
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 7 })
  licensePlate: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column({ type: 'smallint' })
  year: number;

  @CreateDateColumn()
  createdAt?: Date;
};
