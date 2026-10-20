import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Service } from '../entity/service.entity';

type ServiceInput = Omit<Service, 'id' | 'active' | 'createdAt' | 'updatedAt'> & {
  active?: boolean;
};

@Injectable()
export class ServiceApplicationService {
  private readonly services: Service[] = [];

  list(): Service[] {
    return [...this.services];
  }

  create(input: ServiceInput): Service {
    if (input.price < 0) throw new BadRequestException('Price must be non-negative');
    const service = { ...input, id: randomUUID(), active: input.active ?? true };
    this.services.push(service);
    return service;
  }

  findById(id: string): Service | undefined {
    return this.services.find((service) => service.id === id);
  }
}
