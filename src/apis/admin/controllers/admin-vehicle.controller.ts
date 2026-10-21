import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateVehicleDto } from '../../../core/dtos/create-vehicle.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { CustomerApplicationService } from '../../customer/services/customer-application.service';

@ApiTags('admin/vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/vehicles')
export class AdminVehicleController {
  constructor(private readonly customerApp: CustomerApplicationService) {}

  @Get()
  @ApiOperation({ summary: 'List vehicles' })
  list() {
    return this.customerApp.listVehicles();
  }

  @Post()
  @ApiOperation({ summary: 'Create a vehicle' })
  create(@Body() body: CreateVehicleDto) {
    return this.customerApp.createVehicle(body);
  }
}
