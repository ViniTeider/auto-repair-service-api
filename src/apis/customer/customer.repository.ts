import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../../core/entities/customer.entity';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repository: Repository<CustomerEntity>,
  ) {}

  findAll(): Promise<CustomerEntity[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<CustomerEntity | null> {
    return this.repository.findOneBy({ id });
  }

  findByDocument(document: string): Promise<CustomerEntity | null> {
    return this.repository.findOneBy({ document });
  }

  save(entity: CustomerEntity): Promise<CustomerEntity> {
    return this.repository.save(entity);
  }

  async remove(entity: CustomerEntity): Promise<void> {
    await this.repository.remove(entity);
  }
}
