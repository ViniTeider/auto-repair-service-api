import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { CreateCustomerDto } from '../../core/dtos/customer/create-customer.dto';
import { CreatePartDto } from '../../core/dtos/part/create-part.dto';
import { CreateServiceDto } from '../../core/dtos/service/create-service.dto';
import { CreateVehicleDto } from '../../core/dtos/vehicle/create-vehicle.dto';
import { OpenWorkOrderDto } from '../../core/dtos/work-order/open-work-order.dto';
import { ReplenishPartDto } from '../../core/dtos/part/replenish-part.dto';
import { UpdateCustomerDto } from '../../core/dtos/customer/update-customer.dto';
import { WorkOrderActionEnum } from '../../core/enums/work-order/work-order-action.enum';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CustomerApplicationService } from '../customer/services/customer-application.service';
import { InventoryApplicationService } from '../inventory/services/inventory-application.service';
import { ServiceApplicationService } from '../service/services/service-application.service';
import { WorkOrderApplicationService } from '../work-order/services/work-order-application.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly customerApp: CustomerApplicationService,
    private readonly inventoryApp: InventoryApplicationService,
    private readonly serviceApp: ServiceApplicationService,
    private readonly workOrderApp: WorkOrderApplicationService,
  ) {}

  @Get('customers') @ApiOperation({ summary: 'List customers' }) customers() {
    return this.customerApp.listCustomers();
  }
  @Post('customers')
  @ApiOperation({ summary: 'Create a customer' })
  createCustomer(@Body() body: CreateCustomerDto) {
    return this.customerApp.createCustomer(body);
  }
  @Get('customers/:id')
  @ApiOperation({ summary: 'Get a customer' })
  @ApiParam({ name: 'id' })
  customer(@Param('id') id: string) {
    return this.customerApp.getCustomer(id);
  }
  @Patch('customers/:id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id' })
  updateCustomer(@Param('id') id: string, @Body() body: UpdateCustomerDto) {
    return this.customerApp.updateCustomer(id, body);
  }
  @Delete('customers/:id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id' })
  deleteCustomer(@Param('id') id: string) {
    return this.customerApp.deleteCustomer(id);
  }

  @Get('vehicles') @ApiOperation({ summary: 'List vehicles' }) vehicles() {
    return this.customerApp.listVehicles();
  }
  @Post('vehicles')
  @ApiOperation({ summary: 'Create a vehicle' })
  createVehicle(@Body() body: CreateVehicleDto) {
    return this.customerApp.createVehicle(body);
  }

  @Get('services') @ApiOperation({ summary: 'List services' }) services() {
    return this.serviceApp.list();
  }
  @Post('services')
  @ApiOperation({ summary: 'Create a service' })
  createService(@Body() body: CreateServiceDto) {
    return this.serviceApp.create(body);
  }

  @Get('parts') @ApiOperation({ summary: 'List parts' }) parts() {
    return this.inventoryApp.listParts();
  }
  @Post('parts') @ApiOperation({ summary: 'Create a part' }) createPart(
    @Body() body: CreatePartDto,
  ) {
    return this.inventoryApp.createPart(body);
  }
  @Post('parts/:id/stock')
  @ApiOperation({ summary: 'Replenish part stock' })
  @ApiParam({ name: 'id' })
  replenishPart(@Param('id') id: string, @Body() body: ReplenishPartDto) {
    return this.inventoryApp.replenish(id, body.quantity);
  }

  @Post('work-orders')
  @ApiOperation({ summary: 'Open a work order' })
  openOrder(@Body() body: OpenWorkOrderDto) {
    return this.workOrderApp.open(body);
  }
  @Get('work-orders') @ApiOperation({ summary: 'List work orders' }) orders() {
    return this.workOrderApp.list();
  }
  @Get('work-orders/:code')
  @ApiOperation({ summary: 'Get a work order' })
  @ApiParam({ name: 'code' })
  order(@Param('code') code: string) {
    return this.workOrderApp.get(code);
  }
  @Post('work-orders/:code/items')
  @ApiOperation({ summary: 'Add an item to a work order' })
  @ApiParam({ name: 'code' })
  addItem(@Param('code') code: string, @Body() body: AddItemDto) {
    return this.workOrderApp.addItem(code, body);
  }
  @Post('work-orders/:code/:action')
  @ApiOperation({ summary: 'Transition a work order' })
  @ApiParam({ name: 'code' })
  @ApiParam({ name: 'action', enum: WorkOrderActionEnum })
  transition(
    @Param('code') code: string,
    @Param('action') action: WorkOrderActionEnum,
  ) {
    return this.workOrderApp.transition(code, action);
  }

  @Get('metrics/average-execution-time')
  @ApiOperation({ summary: 'Get average execution time' })
  metrics() {
    return this.workOrderApp.averageExecutionTime();
  }
}
