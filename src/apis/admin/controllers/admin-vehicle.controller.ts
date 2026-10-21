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
import { CreateVehicleDto } from '../../../core/dtos/vehicle/create-vehicle.dto';
import { UpdateVehicleDto } from '../../../core/dtos/vehicle/update-vehicle.dto';
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a vehicle' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.customerApp.getVehicle(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() body: UpdateVehicleDto) {
    return this.customerApp.updateVehicle(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.customerApp.deleteVehicle(id);
  }
}
