import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartEntity } from '../../core/entities/part.entity';
import { StockMovementEntity } from '../../core/entities/stock-movement.entity';
import { StockMovementTypeEnum } from '../../core/enums/stock-movement-type.enum';

@Injectable()
export class InventoryRepository {
  constructor(
    @InjectRepository(StockMovementEntity)
    private readonly repository: Repository<StockMovementEntity>,
  ) {}

  // Locks the part so the balance change and its movement are recorded atomically.
  // Returns null when the part does not exist.
  move(
    partId: string,
    resolveBalance: (current: number) => number,
    movement: {
      type: StockMovementTypeEnum;
      quantity: number;
      reason?: string;
    },
  ): Promise<{ balance: number; movement: StockMovementEntity } | null> {
    return this.repository.manager.transaction(async (manager) => {
      const part = await manager.findOne(PartEntity, {
        where: { id: partId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!part) return null;
      part.stock = resolveBalance(part.stock);
      await manager.save(part);
      const saved = await manager.save(
        Object.assign(new StockMovementEntity(), { partId, ...movement }),
      );
      return { balance: part.stock, movement: saved };
    });
  }
}
