import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('customer')
@Unique(['document'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 14 })
  document: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
};
