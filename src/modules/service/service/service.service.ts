import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceRepository } from '../repository/service.repository';

@Injectable()
export class ServiceService {
  constructor(private readonly services: ServiceRepository) {}

  list() {
    return this.services.findAll();
  }

  async getById(id: string) {
    const service = await this.services.findById(id);
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }
}
