import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateServiceDto } from '../../../core/dtos/create-service.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { ServiceApplicationService } from '../../service/services/service-application.service';

@ApiTags('admin/services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/services')
export class AdminServiceController {
  constructor(private readonly serviceApp: ServiceApplicationService) {}

  @Get()
  @ApiOperation({ summary: 'List services' })
  list() {
    return this.serviceApp.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create a service' })
  create(@Body() body: CreateServiceDto) {
    return this.serviceApp.create(body);
  }
}
