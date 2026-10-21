import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Money } from '../../../core/domain/value-objects/money.value-object';
import { CreatePartDto } from '../../../core/dtos/part/create-part.dto';
import { UpdatePartDto } from '../../../core/dtos/part/update-part.dto';
import { PartEntity } from '../../../core/entities/part.entity';
import { isForeignKeyViolation } from '../../../core/utils/database-error.util';
import { PartRepository } from '../part.repository';

// Prices are received and returned as currency amounts, and persisted as cents.
@Injectable()
export class PartService {
  constructor(private readonly parts: PartRepository) {}

  async create(dto: CreatePartDto): Promise<PartEntity> {
    await this.assertNameAvailable(dto.name);
    const part = Object.assign(new PartEntity(), dto, {
      price: Money.fromAmount(dto.price).cents,
    });
    return this.toResponse(await this.parts.save(part));
  }

  async list(): Promise<PartEntity[]> {
    return (await this.parts.findAll()).map((part) => this.toResponse(part));
  }

  async getById(id: string): Promise<PartEntity> {
    return this.toResponse(await this.findOrFail(id));
  }

  async update(id: string, dto: UpdatePartDto): Promise<PartEntity> {
    const part = await this.findOrFail(id);
    if (dto.name && dto.name !== part.name)
      await this.assertNameAvailable(dto.name);
    const { price, ...rest } = dto;
    Object.assign(part, rest);
    if (price !== undefined) part.price = Money.fromAmount(price).cents;
    return this.toResponse(await this.parts.save(part));
  }

  async remove(id: string): Promise<void> {
    const part = await this.findOrFail(id);
    try {
      await this.parts.remove(part);
    } catch (error) {
      if (isForeignKeyViolation(error))
        throw new ConflictException('Part is referenced by stock movements');
      throw error;
    }
  }

  private async findOrFail(id: string): Promise<PartEntity> {
    const part = await this.parts.findById(id);
    if (!part) throw new NotFoundException('Part not found');
    return part;
  }

  private async assertNameAvailable(name: string): Promise<void> {
    if (await this.parts.findByName(name))
      throw new ConflictException('Part name already exists');
  }

  private toResponse(part: PartEntity): PartEntity {
    return Object.assign(new PartEntity(), part, {
      price: Money.fromCents(part.price).toAmount(),
    });
  }
}
