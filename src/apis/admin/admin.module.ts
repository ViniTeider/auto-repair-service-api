import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { CustomerModule } from '../customer/customer.module';
import { PartModule } from '../part/part.module';
import { ServiceModule } from '../service/service.module';
import { WorkOrderModule } from '../work-order/work-order.module';
import { AdminCustomerController } from './controllers/admin-customer.controller';
import { AdminMetricsController } from './controllers/admin-metrics.controller';
import { AdminPartController } from './controllers/admin-part.controller';
import { AdminServiceController } from './controllers/admin-service.controller';
import { AdminVehicleController } from './controllers/admin-vehicle.controller';
import { AdminWorkOrderController } from './controllers/admin-work-order.controller';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    PartModule,
    ServiceModule,
    WorkOrderModule,
  ],
  controllers: [
    AdminCustomerController,
    AdminVehicleController,
    AdminServiceController,
    AdminPartController,
    AdminWorkOrderController,
    AdminMetricsController,
  ],
  providers: [JwtAuthGuard],
})
export class AdminModule {}
