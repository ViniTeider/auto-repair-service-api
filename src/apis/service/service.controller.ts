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
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ServiceService } from './services/service.service';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServiceController {
  constructor(private readonly services: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a service' })
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List services' })
  list() {
    return this.services.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service' })
  @ApiParam({ name: 'id', format: 'uuid' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.services.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id', format: 'uuid' })
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.services.remove(id);
  }
}
