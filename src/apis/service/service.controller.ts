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
import { CreateServiceDto } from '../../core/dtos/service/create-service.dto';
import { UpdateServiceDto } from '../../core/dtos/service/update-service.dto';
import { ApiResponses } from '../../core/decorators/api-responses.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ServiceService } from './services/service.service';

@ApiTags('service')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('service')
export class ServiceController {
  constructor(private readonly services: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a service' })
  @ApiResponses({
    success: { status: HttpStatus.CREATED, description: 'Service created' },
    badRequest: true,
    unauthorized: true,
  })
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List services' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'List of services' },
    unauthorized: true,
  })
  list() {
    return this.services.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'Service found' },
    badRequest: 'Invalid id format',
    unauthorized: true,
    notFound: 'Service not found',
  })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.services.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'Service updated' },
    badRequest: true,
    unauthorized: true,
    notFound: 'Service not found',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.services.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.NO_CONTENT, description: 'Service deleted' },
    badRequest: 'Invalid id format',
    unauthorized: true,
    notFound: 'Service not found',
    conflict: 'Service is referenced by other records',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.services.remove(id);
  }
}
