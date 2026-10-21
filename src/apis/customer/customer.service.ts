import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Document } from '../../core/domain/value-objects/document.value-object';
import { CreateCustomerDto } from '../../core/dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../../core/dtos/customer/update-customer.dto';
import { CustomerEntity } from '../../core/entities/customer.entity';
import { isForeignKeyViolation } from '../../core/utils/database-error.util';
import { CustomerRepository } from './customer.repository';

@Injectable()
export class CustomerService {
  constructor(private readonly customers: CustomerRepository) {}

  async create(dto: CreateCustomerDto): Promise<CustomerEntity> {
    const document = Document.create(dto.document).value;
    await this.assertDocumentAvailable(document);
    return this.customers.save(
      Object.assign(new CustomerEntity(), dto, { document }),
    );
  }

  list(): Promise<CustomerEntity[]> {
    return this.customers.findAll();
  }

  async getById(id: string): Promise<CustomerEntity> {
    const customer = await this.customers.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<CustomerEntity> {
    const customer = await this.getById(id);
    if (dto.document) {
      const document = Document.create(dto.document).value;
      if (document !== customer.document)
        await this.assertDocumentAvailable(document);
      dto.document = document;
    }
    return this.customers.save(Object.assign(customer, dto));
  }

  async remove(id: string): Promise<void> {
    const customer = await this.getById(id);
    try {
      await this.customers.remove(customer);
    } catch (error) {
      if (isForeignKeyViolation(error))
        throw new ConflictException('Customer is referenced by work orders');
      throw error;
    }
  }

  private async assertDocumentAvailable(document: string): Promise<void> {
    if (await this.customers.findByDocument(document)) {
      throw new ConflictException('Customer document already exists');
    }
  }
}
