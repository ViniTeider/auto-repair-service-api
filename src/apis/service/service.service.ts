import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Money } from '../../core/domain/value-objects/money.value-object';
import { CreateServiceDto } from '../../core/dtos/service/create-service.dto';
import { UpdateServiceDto } from '../../core/dtos/service/update-service.dto';
import { ServiceEntity } from '../../core/entities/service.entity';
import { isForeignKeyViolation } from '../../core/utils/database-error.util';
import { ServiceRepository } from './service.repository';

// Prices are received and returned as currency amounts, and persisted as cents.
@Injectable()
export class ServiceService {
  constructor(private readonly services: ServiceRepository) {}

  async create(dto: CreateServiceDto): Promise<ServiceEntity> {
    const service = Object.assign(new ServiceEntity(), dto, {
      price: Money.fromAmount(dto.price).cents,
    });
    return this.toResponse(await this.services.save(service));
  }

  async list(): Promise<ServiceEntity[]> {
    return (await this.services.findAll()).map((service) =>
      this.toResponse(service),
    );
  }

  async getById(id: string): Promise<ServiceEntity> {
    return this.toResponse(await this.findOrFail(id));
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceEntity> {
    const service = await this.findOrFail(id);
    const { price, ...rest } = dto;
    Object.assign(service, rest);
    if (price !== undefined) service.price = Money.fromAmount(price).cents;
    return this.toResponse(await this.services.save(service));
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOrFail(id);
    try {
      await this.services.remove(service);
    } catch (error) {
      if (isForeignKeyViolation(error))
        throw new ConflictException('Service is referenced by other records');
      throw error;
    }
  }

  private async findOrFail(id: string): Promise<ServiceEntity> {
    const service = await this.services.findById(id);
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  private toResponse(service: ServiceEntity): ServiceEntity {
    return Object.assign(new ServiceEntity(), service, {
      price: Money.fromCents(service.price).toAmount(),
    });
  }
}
