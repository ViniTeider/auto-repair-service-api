import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('part')
@Unique(['name'])
export class Part {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'priceInCents', type: 'integer' })
  price: number;

  @Column({ name: 'stockQuantity', type: 'integer', default: 0 })
  stock: number;

  @Column({ name: 'minimumStock', type: 'integer', default: 0 })
  minimumStock?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
};
