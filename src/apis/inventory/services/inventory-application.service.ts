import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PartEntity } from '../../../core/entities/part.entity';

type PartInput = Omit<
  PartEntity,
  'id' | 'stock' | 'createdAt' | 'updatedAt'
> & {
  stock?: number;
};

@Injectable()
export class InventoryApplicationService {
  private readonly parts: PartEntity[] = [];

  listParts(): PartEntity[] {
    return [...this.parts];
  }

  createPart(input: PartInput): PartEntity {
    if (
      input.price < 0 ||
      (input.stock ?? 0) < 0 ||
      (input.minimumStock ?? 0) < 0
    ) {
      throw new BadRequestException(
        'Price and stock values must be non-negative',
      );
    }
    const part = { ...input, id: randomUUID(), stock: input.stock ?? 0 };
    this.parts.push(part);
    return part;
  }

  findById(id: string): PartEntity | undefined {
    return this.parts.find((part) => part.id === id);
  }

  replenish(id: string, quantity: number): PartEntity {
    const part = this.findById(id);
    if (!part) throw new NotFoundException('Part not found');
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }
    part.stock += quantity;
    return part;
  }

  consume(id: string, quantity: number): void {
    const part = this.findById(id);
    if (!part || part.stock < quantity) {
      throw new BadRequestException('Insufficient stock for budget approval');
    }
    part.stock -= quantity;
  }
}
