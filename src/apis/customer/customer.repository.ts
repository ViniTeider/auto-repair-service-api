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
    return this.repository.find();
  }

  findById(id: string): Promise<CustomerEntity | null> {
    return this.repository.findOneBy({ id });
  }

  save(customer: CustomerEntity): Promise<CustomerEntity> {
    return this.repository.save(customer);
  }
}
