import { Injectable, NotFoundException, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { Document } from '../../shared/domain/value-objects/document';
import { LicensePlate } from '../../shared/domain/value-objects/license-plate';
import { VehicleYear } from '../../shared/domain/value-objects/vehicle-year';
import { Money } from '../../shared/domain/value-objects/money';
import { Quantity } from '../../shared/domain/value-objects/quantity';
import { Customer } from '../customer/domain/customer';
import { Vehicle } from '../customer/domain/vehicle';
import { Part } from '../inventory/domain/part';
import { ServiceOffering } from '../service-catalog/domain/service-offering';
import { StoredWorkOrder, WorkOrder } from '../work-order/domain/work-order';
import { WorkOrderAction } from '../work-order/domain/work-order-status';

@Injectable()
export class ApiService {
  private readonly adminEmail = process.env.ADMIN_DEFAULT_EMAIL ?? 'admin@repair-shop.com';
  private readonly adminPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? 'AdminSecurePassword123!';
  private readonly adminHash = bcrypt.hashSync(this.adminPassword, 10);
  private readonly customers: Customer[] = [];
  private readonly vehicles: Vehicle[] = [];
  private readonly services: ServiceOffering[] = [];
  private readonly parts: Part[] = [];
  private readonly orders: StoredWorkOrder[] = [];

  constructor(private readonly jwt: JwtService) {}

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    if (email !== this.adminEmail || !(await bcrypt.compare(password, this.adminHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { accessToken: await this.jwt.signAsync({ sub: email, role: 'admin' }) };
  }

  list<T>(items: T[]): T[] {
    return [...items];
  }

  createCustomer(input: Omit<Customer, 'id'>): Customer {
    Document.create(input.document);
    if (this.customers.some((customer) => customer.document === input.document.replace(/\D/g, ''))) {
      throw new ConflictException('Customer document already exists');
    }
    const customer = { ...input, id: randomUUID(), document: input.document.replace(/\D/g, '') };
    this.customers.push(customer);
    return customer;
  }

  getCustomer(id: string): Customer {
    const result = this.customers.find((customer) => customer.id === id);
    if (!result) throw new NotFoundException('Customer not found');
    return result;
  }

  updateCustomer(id: string, input: Partial<Omit<Customer, 'id'>>): Customer {
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

  createVehicle(input: Omit<Vehicle, 'id'>): Vehicle {
    const plate = LicensePlate.create(input.licensePlate).value;
    VehicleYear.create(input.year);
    if (this.vehicles.some((vehicle) => vehicle.licensePlate === plate)) {
      throw new ConflictException('Vehicle license plate already exists');
    }
    const vehicle = { ...input, id: randomUUID(), licensePlate: plate };
    this.vehicles.push(vehicle);
    return vehicle;
  }

  createService(input: Omit<ServiceOffering, 'id' | 'active'> & { active?: boolean }): ServiceOffering {
    if (input.price < 0) throw new BadRequestException('Price must be non-negative');
    const service = { ...input, id: randomUUID(), active: input.active ?? true };
    this.services.push(service);
    return service;
  }

  createPart(input: Omit<Part, 'id' | 'stock'> & { stock?: number }): Part {
    if (input.price < 0 || (input.stock ?? 0) < 0 || input.minimumStock < 0) {
      throw new BadRequestException('Price and stock values must be non-negative');
    }
    const part = { ...input, id: randomUUID(), stock: input.stock ?? 0 };
    this.parts.push(part);
    return part;
  }

  openOrder(input: { customerDocument: string; vehiclePlate: string }): StoredWorkOrder {
    const customerDocument = Document.create(input.customerDocument);
    const vehiclePlate = LicensePlate.create(input.vehiclePlate);
    if (!this.customers.some((customer) => customer.document === customerDocument.value)) {
      throw new NotFoundException('Customer not found');
    }
    if (!this.vehicles.some((vehicle) => vehicle.licensePlate === vehiclePlate.value)) {
      throw new NotFoundException('Vehicle not found');
    }
    const order = WorkOrder.open({ id: randomUUID(), customerDocument, vehiclePlate }) as StoredWorkOrder;
    order.history = [{ status: order.status, at: new Date() }];
    this.orders.push(order);
    return order;
  }

  getOrder(code: string, document?: string): StoredWorkOrder {
    const order = this.orders.find((item) => item.code.value === code);
    if (!order || (document && order.customerDocument.value !== Document.create(document).value)) {
      throw new NotFoundException('Work order not found');
    }
    return order;
  }

  addOrderItem(code: string, input: { kind: 'SERVICE' | 'PART'; referenceId: string; quantity: number }): StoredWorkOrder {
    const order = this.getOrder(code);
    const source = input.kind === 'SERVICE'
      ? this.services.find((item) => item.id === input.referenceId)
      : this.parts.find((item) => item.id === input.referenceId);
    if (!source) throw new NotFoundException('Catalog item not found');
    order.addItem({
      kind: input.kind,
      referenceId: source.id,
      description: source.name,
      unitPrice: Money.fromAmount(source.price),
      quantity: Quantity.create(input.quantity),
    });
    return order;
  }

  transition(code: string, action: WorkOrderAction): StoredWorkOrder {
    const order = this.getOrder(code);
    if (action === WorkOrderAction.START_DIAGNOSIS) order.startDiagnosis();
    if (action === WorkOrderAction.FINISH_DIAGNOSIS) order.finishDiagnosis();
    if (action === WorkOrderAction.APPROVE_BUDGET) this.approveBudget(order);
    if (action === WorkOrderAction.REJECT_BUDGET) order.rejectBudget();
    if (action === WorkOrderAction.FINISH_EXECUTION) order.finishExecution();
    if (action === WorkOrderAction.DELIVER) order.deliver();
    order.history.push({ status: order.status, at: new Date() });
    return order;
  }

  private approveBudget(order: StoredWorkOrder): void {
    const requested = new Map<string, number>();
    for (const item of order.itemsSnapshot.filter((candidate) => candidate.kind === 'PART')) {
      requested.set(item.referenceId, (requested.get(item.referenceId) ?? 0) + item.quantity.value);
    }
    for (const [partId, quantity] of requested) {
      const part = this.parts.find((candidate) => candidate.id === partId);
      if (!part || part.stock < quantity) {
        throw new BadRequestException('Insufficient stock for budget approval');
      }
    }
    for (const [partId, quantity] of requested) {
      const part = this.parts.find((candidate) => candidate.id === partId);
      if (part) part.stock -= quantity;
    }
    order.approveBudget();
  }

  replenishPart(id: string, quantity: number): Part {
    const part = this.parts.find((candidate) => candidate.id === id);
    if (!part) throw new NotFoundException('Part not found');
    if (!Number.isInteger(quantity) || quantity <= 0) throw new BadRequestException('Quantity must be greater than zero');
    part.stock += quantity;
    return part;
  }

  averageExecutionTime(): { minutes: number; count: number } {
    const completed = this.orders.filter((order) => order.startedAt && order.finishedAt);
    const total = completed.reduce((sum, order) => sum + (order.finishedAt!.getTime() - order.startedAt!.getTime()), 0);
    return { minutes: completed.length ? total / completed.length / 60000 : 0, count: completed.length };
  }
}
