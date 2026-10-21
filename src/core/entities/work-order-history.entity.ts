import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { WorkOrderStatusEnum } from '../enums/work-order/work-order-status.enum';
import { WorkOrderEntity } from './work-order.entity';

@Entity('work_order_history')
export class WorkOrderHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => WorkOrderEntity, (workOrder) => workOrder.history, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workOrderId' })
  workOrder!: Relation<WorkOrderEntity>;

  @Column({ type: 'uuid' })
  workOrderId!: string;

  @Column({ type: 'varchar', enum: WorkOrderStatusEnum })
  status!: WorkOrderStatusEnum;

  @CreateDateColumn()
  createdAt!: Date;
}
