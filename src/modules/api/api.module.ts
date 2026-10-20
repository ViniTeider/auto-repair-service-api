import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController, AuthController, PublicController } from './api.controller';
import { JwtGuard } from '../identity/jwt.guard';
import { CustomerModule } from '../customer/module/customer.module';
import { InventoryModule } from '../inventory/module/inventory.module';
import { ServiceModule } from '../service/module/service.module';
import { WorkOrderModule } from '../work-order/module/work-order.module';
import { AuthApplicationService } from '../auth/service/auth.application-service';
import { CustomerApplicationService } from '../customer/service/customer.application-service';
import { InventoryApplicationService } from '../inventory/service/inventory.application-service';
import { ServiceApplicationService } from '../service/service/service.application-service';
import { WorkOrderApplicationService } from '../work-order/service/work-order.application-service';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET ?? 'development-secret', signOptions: { expiresIn: 86400 } }),
    CustomerModule,
    InventoryModule,
    ServiceModule,
    WorkOrderModule,
  ],
  controllers: [AuthController, AdminController, PublicController],
  providers: [
    AuthApplicationService,
    CustomerApplicationService,
    InventoryApplicationService,
    ServiceApplicationService,
    WorkOrderApplicationService,
    JwtGuard,
  ],
})
export class ApiModule {}
