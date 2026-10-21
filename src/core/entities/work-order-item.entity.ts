import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CatalogItemKindEnum } from '../enums/catalog-item-kind.enum';
import { WorkOrderEntity } from './work-order.entity';

@Entity('work_order_item')
export class WorkOrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => WorkOrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workOrderId' })
  workOrder!: WorkOrderEntity;

  @Column({ type: 'uuid' })
  workOrderId!: string;

  @Column({ type: 'varchar', enum: CatalogItemKindEnum })
  kind!: CatalogItemKindEnum;

  @Column({ type: 'uuid' })
  referenceId!: string;

  @Column()
  description!: string;

  @Column({ type: 'integer' })
  unitPriceInCents!: number;

  @Column({ type: 'integer' })
  quantity!: number;
}
