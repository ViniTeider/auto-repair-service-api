import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CatalogItemKind, StockMovementType } from '../shared/enums/catalog.enums';
import { BudgetStatus, WorkOrderStatus } from '../modules/work-order/entity/work-order-status';
import { Customer } from '../modules/customer/entity/customer.entity';
import { Vehicle } from '../modules/customer/entity/vehicle.entity';
import { Part } from '../modules/inventory/entity/part.entity';
import { Service } from '../modules/service/entity/service.entity';

@Entity('admin_user')
export class AdminUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity('work_order')
export class WorkOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 30, unique: true })
  code!: string;

  @ManyToOne(() => Customer, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column({ type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => Vehicle, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle!: Vehicle;

  @Column({ type: 'uuid' })
  vehicleId!: string;

  @Column({ type: 'varchar', enum: WorkOrderStatus })
  status!: WorkOrderStatus;

  @Column({ type: 'varchar', enum: BudgetStatus })
  budgetStatus!: BudgetStatus;

  @Column({ type: 'integer', default: 0 })
  totalInCents!: number;

  @Column({ type: 'timestamptz', nullable: true })
  executionStartedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  executionFinishedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity('work_order_item')
export class WorkOrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => WorkOrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workOrderId' })
  workOrder!: WorkOrderEntity;

  @Column({ type: 'uuid' })
  workOrderId!: string;

  @Column({ type: 'varchar', enum: CatalogItemKind })
  kind!: CatalogItemKind;

  @Column({ type: 'uuid' })
  referenceId!: string;

  @Column()
  description!: string;

  @Column({ type: 'integer' })
  unitPriceInCents!: number;

  @Column({ type: 'integer' })
  quantity!: number;
}

@Entity('stock_movement')
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Part, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'partId' })
  part!: Part;

  @Column({ type: 'uuid' })
  partId!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'varchar', enum: StockMovementType })
  type!: StockMovementType;

  @Column({ type: 'varchar', nullable: true })
  reason!: string | null;

  @Column({ type: 'uuid', nullable: true })
  workOrderId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}

export {
  Customer,
  Vehicle,
  Part,
  Service,
  Customer as CustomerEntity,
  Vehicle as VehicleEntity,
  Part as PartEntity,
  Service as ServiceEntity,
};
