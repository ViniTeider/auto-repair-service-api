import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../apis/admin/admin.module';
import { AuthModule } from '../apis/auth/auth.module';
import { CustomerModule } from '../apis/customer/customer.module';
import { InventoryModule } from '../apis/inventory/inventory.module';
import { PublicModule } from '../apis/public/public.module';
import { ServiceModule } from '../apis/service/service.module';
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
    InventoryModule,
    ServiceModule,
    WorkOrderModule,
  ],
})
export class AppModule {}
