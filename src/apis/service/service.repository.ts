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
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<ServiceEntity | null> {
    return this.repository.findOneBy({ id });
  }

  findByName(name: string): Promise<ServiceEntity | null> {
    return this.repository.findOneBy({ name });
  }

  save(entity: ServiceEntity): Promise<ServiceEntity> {
    return this.repository.save(entity);
  }

  async remove(entity: ServiceEntity): Promise<void> {
    await this.repository.remove(entity);
  }
}
