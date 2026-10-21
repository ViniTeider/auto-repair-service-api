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
import { ApiResponses } from '../../core/decorators/api-responses.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { VehicleService } from './vehicle.service';

@ApiTags('vehicle')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicles: VehicleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a vehicle' })
  @ApiResponses({
    success: { status: HttpStatus.CREATED, description: 'Vehicle created' },
    badRequest: true,
    unauthorized: true,
    conflict: 'Vehicle license plate already exists',
    unprocessable: 'Invalid license plate or vehicle year',
  })
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List vehicles' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'List of vehicles' },
    unauthorized: true,
  })
  list() {
    return this.vehicles.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vehicle' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'Vehicle found' },
    badRequest: 'Invalid id format',
    unauthorized: true,
    notFound: 'Vehicle not found',
  })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicles.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'Vehicle updated' },
    badRequest: true,
    unauthorized: true,
    notFound: 'Vehicle not found',
    conflict: 'Vehicle license plate already exists',
    unprocessable: 'Invalid license plate or vehicle year',
  })
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
  @ApiResponses({
    success: { status: HttpStatus.NO_CONTENT, description: 'Vehicle deleted' },
    badRequest: 'Invalid id format',
    unauthorized: true,
    notFound: 'Vehicle not found',
    conflict: 'Vehicle is referenced by work orders',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicles.remove(id);
  }
}
