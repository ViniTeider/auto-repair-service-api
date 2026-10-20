import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entity/service.entity';

@Injectable()
export class ServiceRepository {
  constructor(
    @InjectRepository(Service)
    private readonly repository: Repository<Service>,
  ) {}

  findAll(): Promise<Service[]> {
    return this.repository.find();
  }

  findById(id: string): Promise<Service | null> {
    return this.repository.findOneBy({ id });
  }

  save(service: Service): Promise<Service> {
    return this.repository.save(service);
  }
}
