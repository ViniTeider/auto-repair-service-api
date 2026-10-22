import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Query,
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
import { RemoveItemQueryDto } from '../../core/dtos/work-order/remove-item-query.dto';
import { OpenWorkOrderDto } from '../../core/dtos/work-order/open-work-order.dto';
import { WorkOrderActionEnum } from '../../core/enums/work-order/work-order-action.enum';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { WorkOrderService } from './work-order.service';

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

  @Post(':code/item')
  @ApiOperation({ summary: 'Add an item to a work order' })
  @ApiParam({ name: 'code' })
  @ApiResponses({
    success: {
      status: HttpStatus.CREATED,
      description: 'Item added to the work order',
    },
    unauthorized: true,
    badRequest:
      'Invalid data or insufficient stock: the remaining stock would fall below the minimum stock',
    notFound: 'Work order or catalog item not found',
    unprocessable: 'Items can no longer be changed in the current status',
  })
  addItem(@Param('code') code: string, @Body() dto: AddItemDto) {
    return this.orders.addItem(code, dto);
  }

  @Delete(':code/item/:referenceId')
  @ApiOperation({
    summary: 'Remove a quantity of an item (part or service) from a work order',
  })
  @ApiParam({ name: 'code' })
  @ApiParam({
    name: 'referenceId',
    format: 'uuid',
    description: 'Id of the part or service in the work order',
  })
  @ApiResponses({
    success: {
      status: HttpStatus.OK,
      description: 'Quantity removed from the work order',
    },
    badRequest: 'Invalid reference id or quantity',
    unauthorized: true,
    notFound: 'Work order not found',
    unprocessable:
      'Item not in the work order, quantity greater than the amount in it, or items can no longer be changed',
  })
  removeItem(
    @Param('code') code: string,
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
    @Query() query: RemoveItemQueryDto,
  ) {
    return this.orders.removeItem(code, referenceId, query.quantity);
  }

  @Post(':code/send-budget')
  @ApiOperation({
    summary:
      'Email the budget to the work order customer with a link to approve or deny it',
  })
  @ApiParam({ name: 'code' })
  @ApiResponses({
    success: { status: HttpStatus.CREATED, description: 'Budget email sent' },
    unauthorized: true,
    notFound: 'Work order not found',
    unprocessable: 'Work order is not awaiting approval or has no items',
    serviceUnavailable: 'Unable to send the email',
  })
  sendBudget(@Param('code') code: string) {
    return this.orders.sendBudget(code);
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
