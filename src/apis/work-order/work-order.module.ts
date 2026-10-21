import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderEntity } from '../../core/entities/work-order.entity';
import { AuthModule } from '../auth/auth.module';
import { CustomerModule } from '../customer/customer.module';
import { PartModule } from '../part/part.module';
import { ServiceModule } from '../service/service.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { WorkOrderService } from './services/work-order.service';
import { WorkOrderController } from './work-order.controller';
import { WorkOrderRepository } from './work-order.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrderEntity]),
    AuthModule,
    CustomerModule,
    VehicleModule,
    PartModule,
    ServiceModule,
  ],
  controllers: [WorkOrderController],
  providers: [WorkOrderRepository, WorkOrderService],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}
