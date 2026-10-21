import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../apis/admin/admin.module';
import { AuthModule } from '../apis/auth/auth.module';
import { CustomerModule } from '../apis/customer/customer.module';
import { PartModule } from '../apis/part/part.module';
import { PublicModule } from '../apis/public/public.module';
import { ServiceModule } from '../apis/service/service.module';
import { VehicleModule } from '../apis/vehicle/vehicle.module';
import { WorkOrderModule } from '../apis/work-order/work-order.module';
import { AppDataSource } from '../core/database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    AuthModule,
    AdminModule,
    PublicModule,
    CustomerModule,
    PartModule,
    ServiceModule,
    VehicleModule,
    WorkOrderModule,
  ],
})
export class AppModule {}
