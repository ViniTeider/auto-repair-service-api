import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../apis/auth/auth.module';
import { CustomerModule } from '../apis/customer/customer.module';
import { PartModule } from '../apis/part/part.module';
import { PublicModule } from '../apis/public/public.module';
import { ServiceModule } from '../apis/service/service.module';
import { VehicleModule } from '../apis/vehicle/vehicle.module';
import { WorkOrderModule } from '../apis/work-order/work-order.module';
import { AppDataSource } from '../core/database/data-source';
import { HttpExceptionFilter } from '../core/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    AuthModule,
    PublicModule,
    CustomerModule,
    PartModule,
    ServiceModule,
    VehicleModule,
    WorkOrderModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
