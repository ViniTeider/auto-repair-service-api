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
import { CreateServiceDto } from '../../../core/dtos/service/create-service.dto';
import { UpdateServiceDto } from '../../../core/dtos/service/update-service.dto';
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a service' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.serviceApp.get(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() body: UpdateServiceDto) {
    return this.serviceApp.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.serviceApp.remove(id);
  }
}
