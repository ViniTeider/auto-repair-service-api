import { Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiResponses } from '../../core/decorators/api-responses.decorator';
import { WorkOrderService } from '../work-order/services/work-order.service';

@ApiTags('public/work-order')
@Controller('public/work-order')
export class PublicController {
  constructor(private readonly orders: WorkOrderService) {}

  @Get(':code')
  @ApiOperation({ summary: 'Track a work order' })
  @ApiParam({ name: 'code' })
  @ApiResponses({
    success: {
      status: HttpStatus.OK,
      description: 'Current work order progress',
    },
    notFound: 'Work order not found',
  })
  progress(@Param('code') code: string) {
    return this.orders.getProgress(code);
  }

  @Post(':code/approve')
  @ApiOperation({ summary: 'Approve the budget of a work order' })
  @ApiParam({ name: 'code' })
  @ApiResponses({
    success: {
      status: HttpStatus.CREATED,
      description: 'Budget approved and execution started',
    },
    badRequest: 'Insufficient stock for budget approval',
    notFound: 'Work order not found',
    unprocessable: 'Work order is not awaiting approval',
  })
  approve(@Param('code') code: string) {
    return this.orders.approve(code);
  }

  @Post(':code/deny')
  @ApiOperation({ summary: 'Deny the budget of a work order' })
  @ApiParam({ name: 'code' })
  @ApiResponses({
    success: {
      status: HttpStatus.CREATED,
      description: 'Budget denied and work order returned to diagnosis',
    },
    notFound: 'Work order not found',
    unprocessable: 'Work order is not awaiting approval',
  })
  deny(@Param('code') code: string) {
    return this.orders.deny(code);
  }
}
