import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AdminUserEntity } from '../entities/admin-user.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { PartEntity } from '../entities/part.entity';
import { ServiceEntity } from '../entities/service.entity';
import { StockMovementEntity } from '../entities/stock-movement.entity';
import { VehicleEntity } from '../entities/vehicle.entity';
import { WorkOrderHistoryEntity } from '../entities/work-order-history.entity';
import { WorkOrderEntity } from '../entities/work-order.entity';
import { WorkOrderItemEntity } from '../entities/work-order-item.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'repair_shop_db',
  entities: [
    AdminUserEntity,
    CustomerEntity,
    VehicleEntity,
    ServiceEntity,
    PartEntity,
    WorkOrderEntity,
    WorkOrderItemEntity,
    WorkOrderHistoryEntity,
    StockMovementEntity,
  ],
  migrations: ['dist/core/database/migrations/*.js'],
  synchronize: false,
  migrationsRun: true,
});
