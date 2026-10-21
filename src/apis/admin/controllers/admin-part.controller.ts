import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePartDto } from '../../../core/dtos/part/create-part.dto';
import { ReplenishPartDto } from '../../../core/dtos/part/replenish-part.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { PartApplicationService } from '../../part/services/part-application.service';

@ApiTags('admin/parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/parts')
export class AdminPartController {
  constructor(private readonly partApp: PartApplicationService) {}

  @Get()
  @ApiOperation({ summary: 'List parts' })
  list() {
    return this.partApp.listParts();
  }

  @Post()
  @ApiOperation({ summary: 'Create a part' })
  create(@Body() body: CreatePartDto) {
    return this.partApp.createPart(body);
  }

  @Post(':id/stock')
  @ApiOperation({ summary: 'Replenish part stock' })
  @ApiParam({ name: 'id' })
  replenish(@Param('id') id: string, @Body() body: ReplenishPartDto) {
    return this.partApp.replenish(id, body.quantity);
  }
}
