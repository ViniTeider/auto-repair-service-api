import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';

@Injectable()
export class CustomerService {
  constructor(private readonly customers: CustomerRepository) {}

  list() {
    return this.customers.findAll();
  }

  async getById(id: string) {
    const customer = await this.customers.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}
