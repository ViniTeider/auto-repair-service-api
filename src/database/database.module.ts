import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([
      AdminUserEntity,
      CustomerEntity,
      VehicleEntity,
      ServiceEntity,
      PartEntity,
      WorkOrderEntity,
      WorkOrderItemEntity,
      StockMovementEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
