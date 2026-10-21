import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkOrderApplicationService } from '../work-order/services/work-order-application.service';

@ApiTags('public')
@Controller('public/work-orders')
export class PublicController {
  constructor(private readonly workOrderApp: WorkOrderApplicationService) {}
  @Get(':code')
  @ApiOperation({ summary: 'Track a work order publicly' })
  @ApiParam({ name: 'code' })
  @ApiQuery({ name: 'document', required: false })
  @ApiResponse({ status: 200, description: 'Current work order progress' })
  progress(@Param('code') code: string, @Query('document') document?: string) {
    const order = this.workOrderApp.get(code, document);
    return {
      code: order.code.value,
      status: order.status,
      history: order.history,
    };
  }
}
