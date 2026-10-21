import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AddItemDto } from '../../core/dtos/work-order/add-item.dto';
import { OpenWorkOrderDto } from '../../core/dtos/work-order/open-work-order.dto';
import { WorkOrderActionEnum } from '../../core/enums/work-order/work-order-action.enum';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { WorkOrderService } from './services/work-order.service';

@ApiTags('work-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly orders: WorkOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Open a work order' })
  open(@Body() dto: OpenWorkOrderDto) {
    return this.orders.open(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List work orders' })
  list() {
    return this.orders.list();
  }

  @Get('metrics/average-execution-time')
  @ApiOperation({ summary: 'Get average execution time' })
  averageExecutionTime() {
    return this.orders.averageExecutionTime();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get a work order' })
  @ApiParam({ name: 'code' })
  getByCode(@Param('code') code: string) {
    return this.orders.getByCode(code);
  }

  @Post(':code/items')
  @ApiOperation({ summary: 'Add an item to a work order' })
  @ApiParam({ name: 'code' })
  addItem(@Param('code') code: string, @Body() dto: AddItemDto) {
    return this.orders.addItem(code, dto);
  }

  @Post(':code/:action')
  @ApiOperation({ summary: 'Transition a work order' })
  @ApiParam({ name: 'code' })
  @ApiParam({ name: 'action', enum: WorkOrderActionEnum })
  transition(
    @Param('code') code: string,
    @Param('action', new ParseEnumPipe(WorkOrderActionEnum))
    action: WorkOrderActionEnum,
  ) {
    return this.orders.transition(code, action);
  }
}
