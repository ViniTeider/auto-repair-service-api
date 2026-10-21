import { Module } from '@nestjs/common';
import { WorkOrderModule } from '../work-order/work-order.module';
import { PublicController } from './public.controller';

@Module({
  imports: [WorkOrderModule],
  controllers: [PublicController],
})
export class PublicModule {}
