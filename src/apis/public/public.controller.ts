import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkOrderService } from '../work-order/services/work-order.service';

@ApiTags('public')
@Controller('public/work-orders')
export class PublicController {
  constructor(private readonly orders: WorkOrderService) {}

  @Get(':code')
  @ApiOperation({ summary: 'Track a work order publicly' })
  @ApiParam({ name: 'code' })
  @ApiQuery({ name: 'document', required: false })
  @ApiResponse({ status: 200, description: 'Current work order progress' })
  progress(@Param('code') code: string, @Query('document') document?: string) {
    return this.orders.getProgress(code, document);
  }
}
