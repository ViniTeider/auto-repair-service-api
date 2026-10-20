import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { WorkOrderService } from '../service/work-order.service';

@ApiTags('work-orders')
@Controller('persisted-work-orders')
export class WorkOrderController {
  constructor(private readonly orders: WorkOrderService) {}

  @Get()
  @ApiOperation({ summary: 'List persisted work orders' })
  list() {
    return this.orders.list();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get a persisted work order' })
  @ApiParam({ name: 'code' })
  getByCode(@Param('code') code: string) {
    return this.orders.getByCode(code);
  }
}
