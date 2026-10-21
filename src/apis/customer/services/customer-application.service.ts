import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Document } from '../../../core/domain/value-objects/document.value-object';
import { LicensePlate } from '../../../core/domain/value-objects/license-plate.value-object';
import { VehicleYear } from '../../../core/domain/value-objects/vehicle-year.value-object';
import { CustomerEntity } from '../../../core/entities/customer.entity';
import { VehicleEntity } from '../../../core/entities/vehicle.entity';

type CustomerInput = Omit<CustomerEntity, 'id' | 'createdAt' | 'updatedAt'>;
type VehicleInput = Omit<VehicleEntity, 'id' | 'createdAt'>;

@Injectable()
export class CustomerApplicationService {
  private readonly customers: CustomerEntity[] = [];
  private readonly vehicles: VehicleEntity[] = [];

  listCustomers(): CustomerEntity[] {
    return [...this.customers];
  }

  createCustomer(input: CustomerInput): CustomerEntity {
    const document = Document.create(input.document).value;
    if (this.customers.some((customer) => customer.document === document)) {
      throw new ConflictException('Customer document already exists');
    }
    const customer = { ...input, id: randomUUID(), document };
    this.customers.push(customer);
    return customer;
  }

  getCustomer(id: string): CustomerEntity {
    const customer = this.customers.find((candidate) => candidate.id === id);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  updateCustomer(
    id: string,
    input: Partial<Omit<CustomerEntity, 'id' | 'createdAt' | 'updatedAt'>>,
  ): CustomerEntity {
    const customer = this.getCustomer(id);
    Object.assign(customer, input);
    if (input.document)
      customer.document = Document.create(input.document).value;
    return customer;
  }

  deleteCustomer(id: string): void {
    const index = this.customers.findIndex((customer) => customer.id === id);
    if (index < 0) throw new NotFoundException('Customer not found');
    this.customers.splice(index, 1);
  }

  listVehicles(): VehicleEntity[] {
    return [...this.vehicles];
  }

  createVehicle(input: VehicleInput): VehicleEntity {
    const licensePlate = LicensePlate.create(input.licensePlate).value;
    VehicleYear.create(input.year);
    if (
      this.vehicles.some((vehicle) => vehicle.licensePlate === licensePlate)
    ) {
      throw new ConflictException('Vehicle license plate already exists');
    }
    const vehicle = { ...input, id: randomUUID(), licensePlate };
    this.vehicles.push(vehicle);
    return vehicle;
  }

  hasCustomer(document: string): boolean {
    return this.customers.some((customer) => customer.document === document);
  }

  hasVehicle(licensePlate: string): boolean {
    return this.vehicles.some(
      (vehicle) => vehicle.licensePlate === licensePlate,
    );
  }
}
