import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AddItemDto } from '../../../core/dtos/work-order/add-item.dto';
import { OpenWorkOrderDto } from '../../../core/dtos/work-order/open-work-order.dto';
import { WorkOrderActionEnum } from '../../../core/enums/work-order/work-order-action.enum';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { WorkOrderApplicationService } from '../../work-order/services/work-order-application.service';

@ApiTags('admin/work-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/work-orders')
export class AdminWorkOrderController {
  constructor(private readonly workOrderApp: WorkOrderApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Open a work order' })
  open(@Body() body: OpenWorkOrderDto) {
    return this.workOrderApp.open(body);
  }

  @Get()
  @ApiOperation({ summary: 'List work orders' })
  list() {
    return this.workOrderApp.list();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get a work order' })
  @ApiParam({ name: 'code' })
  findOne(@Param('code') code: string) {
    return this.workOrderApp.get(code);
  }

  @Post(':code/items')
  @ApiOperation({ summary: 'Add an item to a work order' })
  @ApiParam({ name: 'code' })
  addItem(@Param('code') code: string, @Body() body: AddItemDto) {
    return this.workOrderApp.addItem(code, body);
  }

  @Post(':code/:action')
  @ApiOperation({ summary: 'Transition a work order' })
  @ApiParam({ name: 'code' })
  @ApiParam({ name: 'action', enum: WorkOrderActionEnum })
  transition(
    @Param('code') code: string,
    @Param('action') action: WorkOrderActionEnum,
  ) {
    return this.workOrderApp.transition(code, action);
  }
}
