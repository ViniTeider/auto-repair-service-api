import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  AdminUserEntity,
  CustomerEntity,
  PartEntity,
  ServiceEntity,
  StockMovementEntity,
  VehicleEntity,
  WorkOrderEntity,
  WorkOrderItemEntity,
} from './entities';

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
    StockMovementEntity,
  ],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  migrationsRun: true,
});
