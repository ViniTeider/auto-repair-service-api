import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PartService } from '../service/part.service';

@ApiTags('parts')
@Controller('parts')
export class PartController {
  constructor(private readonly parts: PartService) {}

  @Get()
  @ApiOperation({ summary: 'List persisted parts' })
  list() {
    return this.parts.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a persisted part' })
  @ApiParam({ name: 'id', format: 'uuid' })
  getById(@Param('id') id: string) {
    return this.parts.getById(id);
  }
}
