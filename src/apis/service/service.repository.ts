import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from '../../core/entities/service.entity';

@Injectable()
export class ServiceRepository {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly repository: Repository<ServiceEntity>,
  ) {}

  findAll(): Promise<ServiceEntity[]> {
    return this.repository.find();
  }

  findById(id: string): Promise<ServiceEntity | null> {
    return this.repository.findOneBy({ id });
  }

  save(service: ServiceEntity): Promise<ServiceEntity> {
    return this.repository.save(service);
  }
}
