import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiService } from './api.service';
import { JwtGuard } from '../identity/jwt.guard';
import { AddItemDto, CreateCustomerDto, CreatePartDto, CreateServiceDto, CreateVehicleDto, LoginDto } from './dtos';
import { WorkOrderAction } from '../work-order/domain/work-order-status';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly api: ApiService) {}
  @Post('login')
  login(@Body() body: LoginDto) { return this.api.login(body.email, body.password); }
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly api: ApiService) {}
  @Get('customers') customers() { return this.api.list(this.api['customers']); }
  @Post('customers') createCustomer(@Body() body: CreateCustomerDto) { return this.api.createCustomer(body); }
  @Get('customers/:id') customer(@Param('id') id: string) { return this.api.getCustomer(id); }
  @Patch('customers/:id') updateCustomer(@Param('id') id: string, @Body() body: Record<string, string>) { return this.api.updateCustomer(id, body); }
  @Delete('customers/:id') deleteCustomer(@Param('id') id: string) { return this.api.deleteCustomer(id); }
  @Get('vehicles') vehicles() { return this.api.list(this.api['vehicles']); }
  @Post('vehicles') createVehicle(@Body() body: CreateVehicleDto) { return this.api.createVehicle(body); }
  @Get('services') services() { return this.api.list(this.api['services']); }
  @Post('services') createService(@Body() body: CreateServiceDto) { return this.api.createService(body); }
  @Get('parts') parts() { return this.api.list(this.api['parts']); }
  @Post('parts') createPart(@Body() body: CreatePartDto) { return this.api.createPart(body); }
  @Post('parts/:id/stock') replenishPart(@Param('id') id: string, @Body() body: { quantity: number }) { return this.api.replenishPart(id, body.quantity); }
  @Post('work-orders') openOrder(@Body() body: { customerDocument: string; vehiclePlate: string }) { return this.api.openOrder(body); }
  @Get('work-orders') orders() { return this.api.list(this.api['orders']); }
  @Get('work-orders/:code') order(@Param('code') code: string) { return this.api.getOrder(code); }
  @Post('work-orders/:code/items') addItem(@Param('code') code: string, @Body() body: AddItemDto) { return this.api.addOrderItem(code, body); }
  @Post('work-orders/:code/:action') transition(@Param('code') code: string, @Param('action') action: WorkOrderAction) { return this.api.transition(code, action); }
  @Get('metrics/average-execution-time') metrics() { return this.api.averageExecutionTime(); }
}

@ApiTags('public')
@Controller('public/work-orders')
export class PublicController {
  constructor(private readonly api: ApiService) {}
  @Get(':code')
  progress(@Param('code') code: string, @Query('document') document?: string) {
    const order = this.api.getOrder(code, document);
    return { code: order.code.value, status: order.status, history: order.history };
  }
}
