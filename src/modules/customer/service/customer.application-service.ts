import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Document } from '../../../shared/domain/value-objects/document';
import { LicensePlate } from '../../../shared/domain/value-objects/license-plate';
import { VehicleYear } from '../../../shared/domain/value-objects/vehicle-year';
import { Customer } from '../entity/customer.entity';
import { Vehicle } from '../entity/vehicle.entity';

type CustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
type VehicleInput = Omit<Vehicle, 'id' | 'createdAt'>;

@Injectable()
export class CustomerApplicationService {
  private readonly customers: Customer[] = [];
  private readonly vehicles: Vehicle[] = [];

  listCustomers(): Customer[] {
    return [...this.customers];
  }

  createCustomer(input: CustomerInput): Customer {
    const document = Document.create(input.document).value;
    if (this.customers.some((customer) => customer.document === document)) {
      throw new ConflictException('Customer document already exists');
    }
    const customer = { ...input, id: randomUUID(), document };
    this.customers.push(customer);
    return customer;
  }

  getCustomer(id: string): Customer {
    const customer = this.customers.find((candidate) => candidate.id === id);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  updateCustomer(
    id: string,
    input: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Customer {
    const customer = this.getCustomer(id);
    Object.assign(customer, input);
    if (input.document) customer.document = Document.create(input.document).value;
    return customer;
  }

  deleteCustomer(id: string): void {
    const index = this.customers.findIndex((customer) => customer.id === id);
    if (index < 0) throw new NotFoundException('Customer not found');
    this.customers.splice(index, 1);
  }

  listVehicles(): Vehicle[] {
    return [...this.vehicles];
  }

  createVehicle(input: VehicleInput): Vehicle {
    const licensePlate = LicensePlate.create(input.licensePlate).value;
    VehicleYear.create(input.year);
    if (this.vehicles.some((vehicle) => vehicle.licensePlate === licensePlate)) {
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
    return this.vehicles.some((vehicle) => vehicle.licensePlate === licensePlate);
  }
}
