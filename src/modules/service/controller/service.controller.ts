import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ServiceService } from '../service/service.service';

@ApiTags('services')
@Controller('services')
export class ServiceController {
  constructor(private readonly services: ServiceService) {}

  @Get()
  @ApiOperation({ summary: 'List persisted services' })
  list() {
    return this.services.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a persisted service' })
  @ApiParam({ name: 'id', format: 'uuid' })
  getById(@Param('id') id: string) {
    return this.services.getById(id);
  }
}
