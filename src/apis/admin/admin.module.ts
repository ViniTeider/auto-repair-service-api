import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { CustomerModule } from '../customer/customer.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ServiceModule } from '../service/service.module';
import { WorkOrderModule } from '../work-order/work-order.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    InventoryModule,
    ServiceModule,
    WorkOrderModule,
  ],
  controllers: [AdminController],
  providers: [JwtAuthGuard],
})
export class AdminModule {}
