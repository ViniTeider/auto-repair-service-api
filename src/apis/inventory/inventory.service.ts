import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Quantity } from '../../core/domain/value-objects/quantity.value-object';
import { CreateStockMovementDto } from '../../core/dtos/create-stock-movement.dto';
import { StockMovementTypeEnum } from '../../core/enums/stock-movement-type.enum';
import { InventoryRepository } from './inventory.repository';

@Injectable()
export class InventoryService {
  constructor(private readonly inventory: InventoryRepository) {}

  async move(dto: CreateStockMovementDto) {
    // ENTRY and EXIT move an amount, so it must be positive; an ADJUSTMENT may set the balance to zero.
    if (dto.type !== StockMovementTypeEnum.ADJUSTMENT) {
      Quantity.create(dto.quantity);
    }
    const result = await this.inventory.move(
      dto.partId,
      (current) => this.nextBalance(dto, current),
      { type: dto.type, quantity: dto.quantity, reason: dto.reason },
    );
    if (!result) throw new NotFoundException('Part not found');
    return {
      partId: dto.partId,
      type: dto.type,
      quantity: dto.quantity,
      reason: result.movement.reason ?? null,
      balance: result.balance,
      createdAt: result.movement.createdAt,
    };
  }

  private nextBalance(dto: CreateStockMovementDto, current: number): number {
    switch (dto.type) {
      case StockMovementTypeEnum.ENTRY:
        return current + dto.quantity;
      case StockMovementTypeEnum.EXIT:
        if (dto.quantity > current) {
          throw new BadRequestException('Insufficient stock for this exit');
        }
        return current - dto.quantity;
      case StockMovementTypeEnum.ADJUSTMENT:
        return dto.quantity;
    }
  }
}
