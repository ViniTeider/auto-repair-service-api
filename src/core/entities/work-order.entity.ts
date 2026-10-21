import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BudgetStatusEnum } from '../enums/work-order/budget-status.enum';
import { WorkOrderStatusEnum } from '../enums/work-order/work-order-status.enum';
import { CustomerEntity } from './customer.entity';
import { VehicleEntity } from './vehicle.entity';

@Entity('work_order')
export class WorkOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 30, unique: true })
  code!: string;

  @ManyToOne(() => CustomerEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer!: CustomerEntity;

  @Column({ type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => VehicleEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle!: VehicleEntity;

  @Column({ type: 'uuid' })
  vehicleId!: string;

  @Column({ type: 'varchar', enum: WorkOrderStatusEnum })
  status!: WorkOrderStatusEnum;

  @Column({ type: 'varchar', enum: BudgetStatusEnum })
  budgetStatus!: BudgetStatusEnum;

  @Column({ type: 'integer', default: 0 })
  totalInCents!: number;

  @Column({ type: 'timestamptz', nullable: true })
  executionStartedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  executionFinishedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
