import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderEntity } from '../../../database/entities';
import { WorkOrderRepository } from '../repository/work-order.repository';
import { WorkOrderService } from '../service/work-order.service';
import { WorkOrderController } from '../controller/work-order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrderEntity])],
  controllers: [WorkOrderController],
  providers: [WorkOrderRepository, WorkOrderService],
  exports: [WorkOrderRepository],
})
export class WorkOrderModule {}
