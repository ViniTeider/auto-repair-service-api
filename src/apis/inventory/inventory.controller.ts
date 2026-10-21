import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponses } from '../../core/decorators/api-responses.decorator';
import { CreateStockMovementDto } from '../../core/dtos/create-stock-movement.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a stock movement (entry, exit or adjustment)',
  })
  @ApiResponses({
    success: {
      status: HttpStatus.CREATED,
      description: 'Stock movement registered and new balance returned',
    },
    badRequest: 'Invalid data or insufficient stock for the exit',
    unauthorized: true,
    notFound: 'Part not found',
    unprocessable: 'Entry and exit quantities must be greater than zero',
  })
  move(@Body() dto: CreateStockMovementDto) {
    return this.inventory.move(dto);
  }
}
