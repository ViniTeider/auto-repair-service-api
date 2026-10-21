import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { CreateVehicleDto } from '../../core/dtos/vehicle/create-vehicle.dto';
import { UpdateVehicleDto } from '../../core/dtos/vehicle/update-vehicle.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { VehicleService } from './vehicle.service';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicles: VehicleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a vehicle' })
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List vehicles' })
  list() {
    return this.vehicles.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vehicle' })
  @ApiParam({ name: 'id', format: 'uuid' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicles.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiParam({ name: 'id', format: 'uuid' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicles.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiParam({ name: 'id', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicles.remove(id);
  }
}
