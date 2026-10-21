import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ServiceEntity } from '../../../core/entities/service.entity';

type ServiceInput = Omit<
  ServiceEntity,
  'id' | 'active' | 'createdAt' | 'updatedAt'
> & {
  active?: boolean;
};

@Injectable()
export class ServiceApplicationService {
  private readonly services: ServiceEntity[] = [];

  list(): ServiceEntity[] {
    return [...this.services];
  }

  create(input: ServiceInput): ServiceEntity {
    if (input.price < 0)
      throw new BadRequestException('Price must be non-negative');
    const service = {
      ...input,
      id: randomUUID(),
      active: input.active ?? true,
    };
    this.services.push(service);
    return service;
  }

  findById(id: string): ServiceEntity | undefined {
    return this.services.find((service) => service.id === id);
  }
}
