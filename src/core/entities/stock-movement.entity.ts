import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockMovementTypeEnum } from '../enums/stock-movement-type.enum';
import { PartEntity } from './part.entity';

@Entity('stock_movement')
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PartEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'partId' })
  part!: PartEntity;

  @Column({ type: 'uuid' })
  partId!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'varchar', enum: StockMovementTypeEnum })
  type!: StockMovementTypeEnum;

  @Column({ type: 'varchar', nullable: true })
  reason!: string | null;

  @Column({ type: 'uuid', nullable: true })
  workOrderId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
