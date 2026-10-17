import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('admin_users')
@Unique(['email'])
export class AdminUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column()
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity('customers')
@Unique(['document'])
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 14 })
  document!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity('vehicles')
@Unique(['licensePlate'])
export class VehicleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 7 })
  licensePlate!: string;

  @Column()
  make!: string;

  @Column()
  model!: string;

  @Column({ type: 'smallint' })
  year!: number;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity('service_offerings')
export class ServiceOfferingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string | null;

  @Column({ type: 'integer' })
  priceInCents!: number;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity('parts')
@Unique(['name'])
export class PartEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'integer' })
  priceInCents!: number;

  @Column({ type: 'integer', default: 0 })
  stockQuantity!: number;

  @Column({ type: 'integer', default: 0 })
  minimumStock!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity('work_orders')
@Unique(['code'])
export class WorkOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 30 })
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

  @Column({ length: 30 })
  status!: string;

  @Column({ length: 20 })
  budgetStatus!: string;

  @Column({ type: 'integer', default: 0 })
  totalInCents!: number;

  @Column({ type: 'timestamptz', nullable: true })
  executionStartedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  executionFinishedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity('work_order_items')
export class WorkOrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => WorkOrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workOrderId' })
  workOrder!: WorkOrderEntity;

  @Column()
  workOrderId!: string;

  @Column({ length: 10 })
  kind!: 'SERVICE' | 'PART';

  @Column()
  referenceId!: string;

  @Column()
  description!: string;

  @Column({ type: 'integer' })
  unitPriceInCents!: number;

  @Column({ type: 'integer' })
  quantity!: number;
}

@Entity('stock_movements')
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  partId!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ length: 20 })
  type!: 'ENTRY' | 'ADJUSTMENT' | 'EXIT';

  @Column({ nullable: true })
  reason!: string | null;

  @Column({ nullable: true })
  workOrderId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
