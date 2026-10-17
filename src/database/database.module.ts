import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import {
  AdminUserEntity,
  CustomerEntity,
  PartEntity,
  ServiceOfferingEntity,
  StockMovementEntity,
  VehicleEntity,
  WorkOrderEntity,
  WorkOrderItemEntity,
} from './entities';

const databaseImports = process.env.NODE_ENV === 'test'
  ? []
  : [
      TypeOrmModule.forRoot({
        ...AppDataSource.options,
        autoLoadEntities: true,
      }),
      TypeOrmModule.forFeature([
        AdminUserEntity,
        CustomerEntity,
        VehicleEntity,
        ServiceOfferingEntity,
        PartEntity,
        WorkOrderEntity,
        WorkOrderItemEntity,
        StockMovementEntity,
      ]),
    ];

@Module({
  imports: databaseImports,
  exports: process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule],
})
export class DatabaseModule {}
