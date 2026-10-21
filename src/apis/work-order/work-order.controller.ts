import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
import { ApiResponses } from '../../core/decorators/api-responses.decorator';
import { AddItemDto } from '../../core/dtos/work-order/add-item.dto';
import { OpenWorkOrderDto } from '../../core/dtos/work-order/open-work-order.dto';
import { WorkOrderActionEnum } from '../../core/enums/work-order/work-order-action.enum';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { WorkOrderService } from './services/work-order.service';

@ApiTags('work-order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('work-order')
export class WorkOrderController {
  constructor(private readonly orders: WorkOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Open a work order' })
  @ApiResponses({
    success: { status: HttpStatus.CREATED, description: 'Work order opened' },
    badRequest: true,
    unauthorized: true,
    notFound: 'Customer or vehicle not found',
    unprocessable: 'Invalid customer document or license plate',
  })
  open(@Body() dto: OpenWorkOrderDto) {
    return this.orders.open(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List work orders' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'List of work orders' },
    unauthorized: true,
  })
  list() {
    return this.orders.list();
  }

  @Get('metrics/average-execution-time')
  @ApiOperation({ summary: 'Get average execution time' })
  @ApiResponses({
    success: {
      status: HttpStatus.OK,
      description:
        'Average execution time in minutes and finished orders count',
    },
    unauthorized: true,
  })
  averageExecutionTime() {
    return this.orders.averageExecutionTime();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get a work order' })
  @ApiParam({ name: 'code' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'Work order found' },
    unauthorized: true,
    notFound: 'Work order not found',
  })
  getByCode(@Param('code') code: string) {
    return this.orders.getByCode(code);
  }

  @Post(':code/items')
  @ApiOperation({ summary: 'Add an item to a work order' })
  @ApiParam({ name: 'code' })
  @ApiResponses({
    success: {
      status: HttpStatus.CREATED,
      description: 'Item added to the work order',
    },
    badRequest: true,
    unauthorized: true,
    notFound: 'Work order or catalog item not found',
    unprocessable: 'Items can no longer be changed in the current status',
  })
  addItem(@Param('code') code: string, @Body() dto: AddItemDto) {
    return this.orders.addItem(code, dto);
  }

  @Post(':code/:action')
  @ApiOperation({ summary: 'Move a work order to a new status' })
  @ApiParam({ name: 'code' })
  @ApiParam({
    name: 'action',
    enum: WorkOrderActionEnum,
    description: 'Status the work order moves to',
  })
  @ApiResponses({
    success: {
      status: HttpStatus.CREATED,
      description: 'Work order moved to the new status',
    },
    badRequest: 'Unknown action',
    unauthorized: true,
    notFound: 'Work order not found',
    unprocessable: 'Transition not allowed from the current status',
  })
  transition(
    @Param('code') code: string,
    @Param('action', new ParseEnumPipe(WorkOrderActionEnum))
    action: WorkOrderActionEnum,
  ) {
    return this.orders.transition(code, action);
  }
}
