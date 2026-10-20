import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entity/customer.entity';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  findAll(): Promise<Customer[]> {
    return this.repository.find();
  }

  findById(id: string): Promise<Customer | null> {
    return this.repository.findOneBy({ id });
  }

  save(customer: Customer): Promise<Customer> {
    return this.repository.save(customer);
  }
}
