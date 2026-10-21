import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderEntity } from '../../core/entities/work-order.entity';
import { CustomerModule } from '../customer/customer.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ServiceModule } from '../service/service.module';
import { WorkOrderRepository } from './work-order.repository';
import { WorkOrderApplicationService } from './services/work-order-application.service';
import { WorkOrderService } from './services/work-order.service';
import { WorkOrderController } from './work-order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrderEntity]),
    CustomerModule,
    InventoryModule,
    ServiceModule,
  ],
  controllers: [WorkOrderController],
  providers: [
    WorkOrderRepository,
    WorkOrderService,
    WorkOrderApplicationService,
  ],
  exports: [WorkOrderRepository, WorkOrderApplicationService],
})
export class WorkOrderModule {}
