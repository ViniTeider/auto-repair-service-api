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
import { ApiResponses } from '../../core/decorators/api-responses.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PartService } from './services/part.service';

@ApiTags('part')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('part')
export class PartController {
  constructor(private readonly parts: PartService) {}

  @Post()
  @ApiOperation({ summary: 'Create a part' })
  @ApiResponses({
    success: { status: HttpStatus.CREATED, description: 'Part created' },
    badRequest: true,
    unauthorized: true,
    conflict: 'Part name already exists',
  })
  create(@Body() dto: CreatePartDto) {
    return this.parts.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List parts' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'List of parts' },
    unauthorized: true,
  })
  list() {
    return this.parts.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a part' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'Part found' },
    badRequest: 'Invalid id format',
    unauthorized: true,
    notFound: 'Part not found',
  })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.parts.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a part' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'Part updated' },
    badRequest: true,
    unauthorized: true,
    notFound: 'Part not found',
    conflict: 'Part name already exists',
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePartDto) {
    return this.parts.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a part' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.NO_CONTENT, description: 'Part deleted' },
    badRequest: 'Invalid id format',
    unauthorized: true,
    notFound: 'Part not found',
    conflict: 'Part is referenced by stock movements',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.parts.remove(id);
  }

  @Post(':id/stock')
  @ApiOperation({ summary: 'Replenish part stock' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.CREATED, description: 'Stock replenished' },
    badRequest: true,
    unauthorized: true,
    notFound: 'Part not found',
  })
  replenish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplenishPartDto,
  ) {
    return this.parts.replenish(id, dto.quantity);
  }
}
