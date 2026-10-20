import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../identity/jwt.guard';
import { AuthApplicationService } from '../auth/service/auth.application-service';
import { CustomerApplicationService } from '../customer/service/customer.application-service';
import { InventoryApplicationService } from '../inventory/service/inventory.application-service';
import { ServiceApplicationService } from '../service/service/service.application-service';
import { WorkOrderApplicationService } from '../work-order/service/work-order.application-service';
import {
  AddItemDto,
  CreateCustomerDto,
  CreatePartDto,
  CreateServiceDto,
  CreateVehicleDto,
  LoginDto,
  OpenWorkOrderDto,
  ReplenishPartDto,
  UpdateCustomerDto,
} from './dtos';
import { WorkOrderAction } from '../work-order/entity/work-order-status';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthApplicationService) {}
  @Post('login')
  @ApiOperation({ summary: 'Authenticate an administrator' })
  @ApiResponse({ status: 201, description: 'JWT access token returned' })
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtGuard)
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
  @ApiParam({ name: 'action', enum: WorkOrderAction })
  transition(
    @Param('code') code: string,
    @Param('action') action: WorkOrderAction,
  ) {
    return this.workOrderApp.transition(code, action);
  }

  @Get('metrics/average-execution-time')
  @ApiOperation({ summary: 'Get average execution time' })
  metrics() {
    return this.workOrderApp.averageExecutionTime();
  }
}

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
