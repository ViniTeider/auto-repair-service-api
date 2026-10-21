import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../apis/auth/auth.module';
import { CustomerModule } from '../apis/customer/customer.module';
import { InventoryModule } from '../apis/inventory/inventory.module';
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
    // The connection reads DB_* through ConfigService so values from the .env file are applied.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        entities: AppDataSource.options.entities,
        migrations: AppDataSource.options.migrations,
        migrationsRun: true,
        synchronize: false,
        host: config.get<string>('DB_HOST') ?? 'localhost',
        port: Number(config.get<string>('DB_PORT') ?? 5432),
        username: config.get<string>('DB_USER') ?? 'postgres',
        password: config.get<string>('DB_PASSWORD') ?? 'postgres',
        database: config.get<string>('DB_NAME') ?? 'repair_shop_db',
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    PublicModule,
    CustomerModule,
    PartModule,
    InventoryModule,
    ServiceModule,
    VehicleModule,
    WorkOrderModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
