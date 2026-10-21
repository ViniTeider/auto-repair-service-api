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
import { CreatePartDto } from '../../core/dtos/part/create-part.dto';
import { ReplenishPartDto } from '../../core/dtos/part/replenish-part.dto';
import { UpdatePartDto } from '../../core/dtos/part/update-part.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PartService } from './services/part.service';

@ApiTags('parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parts')
export class PartController {
  constructor(private readonly parts: PartService) {}

  @Post()
  @ApiOperation({ summary: 'Create a part' })
  create(@Body() dto: CreatePartDto) {
    return this.parts.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List parts' })
  list() {
    return this.parts.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a part' })
  @ApiParam({ name: 'id', format: 'uuid' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.parts.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a part' })
  @ApiParam({ name: 'id', format: 'uuid' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePartDto) {
    return this.parts.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a part' })
  @ApiParam({ name: 'id', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.parts.remove(id);
  }

  @Post(':id/stock')
  @ApiOperation({ summary: 'Replenish part stock' })
  @ApiParam({ name: 'id', format: 'uuid' })
  replenish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplenishPartDto,
  ) {
    return this.parts.replenish(id, dto.quantity);
  }
}
