import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Document } from '../../core/domain/value-objects/document.value-object';
import { LicensePlate } from '../../core/domain/value-objects/license-plate.value-object';
import { Money } from '../../core/domain/value-objects/money.value-object';
import { Quantity } from '../../core/domain/value-objects/quantity.value-object';
import { WorkOrder } from '../../core/domain/work-order.domain';
import { AddItemDto } from '../../core/dtos/work-order/add-item.dto';
import { OpenWorkOrderDto } from '../../core/dtos/work-order/open-work-order.dto';
import {
  WorkOrderBudgetDto,
  WorkOrderResponseDto,
} from '../../core/dtos/work-order/work-order-response.dto';
import { EmailService } from '../../core/email/email.service';
import { PartEntity } from '../../core/entities/part.entity';
import { WorkOrderEntity } from '../../core/entities/work-order.entity';
import { WorkOrderHistoryEntity } from '../../core/entities/work-order-history.entity';
import { WorkOrderItemEntity } from '../../core/entities/work-order-item.entity';
import { CatalogItemKindEnum } from '../../core/enums/catalog-item-kind.enum';
import { WorkOrderActionEnum } from '../../core/enums/work-order/work-order-action.enum';
import { CustomerRepository } from '../customer/customer.repository';
import { PartRepository } from '../part/part.repository';
import { ServiceRepository } from '../service/service.repository';
import { VehicleRepository } from '../vehicle/vehicle.repository';
import { WorkOrderRepository } from './work-order.repository';

@Injectable()
export class WorkOrderService {
  constructor(
    private readonly orders: WorkOrderRepository,
    private readonly customers: CustomerRepository,
    private readonly vehicles: VehicleRepository,
    private readonly parts: PartRepository,
    private readonly services: ServiceRepository,
    private readonly email: EmailService,
  ) {}

  async open(dto: OpenWorkOrderDto): Promise<WorkOrderResponseDto> {
    const customerDocument = Document.create(dto.customerDocument);
    const vehiclePlate = LicensePlate.create(dto.vehiclePlate);
    const customer = await this.customers.findByDocument(
      customerDocument.value,
    );
    if (!customer) throw new NotFoundException('Customer not found');
    const vehicle = await this.vehicles.findByLicensePlate(vehiclePlate.value);
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const order = WorkOrder.open({
      id: randomUUID(),
      customerDocument,
      vehiclePlate,
    });
    const entity = Object.assign(new WorkOrderEntity(), {
      id: order.id,
      code: order.code.value,
      customer,
      vehicle,
      items: [],
      history: [],
    });
    this.sync(entity, order);
    return this.toResponse(await this.orders.save(entity));
  }

  async list(): Promise<WorkOrderResponseDto[]> {
    return (await this.orders.findAll()).map((entity) =>
      this.toResponse(entity),
    );
  }

  async getByCode(code: string): Promise<WorkOrderResponseDto> {
    return this.toResponse(await this.findOrFail(code));
  }

  async getProgress(code: string) {
    return this.toProgress(this.toResponse(await this.findOrFail(code)));
  }

  async addItem(code: string, dto: AddItemDto): Promise<WorkOrderResponseDto> {
    const entity = await this.findOrFail(code);
    const order = this.toDomain(entity);
    const source =
      dto.kind === CatalogItemKindEnum.SERVICE
        ? await this.services.findById(dto.referenceId)
        : await this.parts.findById(dto.referenceId);
    if (!source) throw new NotFoundException('Catalog item not found');
    if (dto.kind === CatalogItemKindEnum.PART) {
      const alreadyInOrder = order.itemsSnapshot
        .filter((item) => item.referenceId === source.id)
        .reduce((total, item) => total + item.quantity.value, 0);
      this.assertStockAvailable(
        source as PartEntity,
        alreadyInOrder + dto.quantity,
      );
    }

    order.addItem({
      kind: dto.kind,
      referenceId: source.id,
      description: source.name,
      unitPrice: Money.fromCents(source.price),
      quantity: Quantity.create(dto.quantity),
    });
    this.syncItems(entity, order);
    this.sync(entity, order);
    await this.orders.save(entity);
    return this.getByCode(code);
  }

  async removeItem(
    code: string,
    referenceId: string,
    quantity: number,
  ): Promise<WorkOrderResponseDto> {
    const entity = await this.findOrFail(code);
    const order = this.toDomain(entity);
    order.removeItem(referenceId, Quantity.create(quantity));
    this.syncItems(entity, order);
    this.sync(entity, order);
    await this.orders.save(entity);
    return this.getByCode(code);
  }

  async sendBudget(code: string): Promise<{ message: string }> {
    const entity = await this.findOrFail(code);
    this.toDomain(entity).sendBudget();
    const response = this.toResponse(entity);
    try {
      await this.email.sendBudgetEmail({
        to: entity.customer.email,
        customerName: entity.customer.name,
        code: entity.code,
        items: response.items,
        total: response.total,
      });
    } catch {
      throw new ServiceUnavailableException('Unable to send the budget email');
    }
    return { message: 'Budget email sent' };
  }

  async getBudget(code: string): Promise<WorkOrderBudgetDto> {
    const entity = await this.findOrFail(code);
    const { items, total, status, budgetStatus, createdAt } =
      this.toResponse(entity);
    return {
      code: entity.code,
      vehicle: {
        licensePlate: entity.vehicle.licensePlate,
        make: entity.vehicle.make,
        model: entity.vehicle.model,
        year: entity.vehicle.year,
      },
      items,
      total,
      status,
      budgetStatus,
      createdAt,
    };
  }

  async transition(
    code: string,
    action: WorkOrderActionEnum,
  ): Promise<WorkOrderResponseDto> {
    return this.apply(code, (order) => {
      switch (action) {
        case WorkOrderActionEnum.START_DIAGNOSIS:
          return order.startDiagnosis();
        case WorkOrderActionEnum.FINISH_DIAGNOSIS:
          return order.finishDiagnosis();
        case WorkOrderActionEnum.FINISH_EXECUTION:
          return order.finishExecution();
        case WorkOrderActionEnum.DELIVER:
          return order.deliver();
      }
    });
  }

  async approve(code: string) {
    return this.toProgress(
      await this.apply(code, (order) => order.approveBudget(), true),
    );
  }

  async deny(code: string) {
    return this.toProgress(
      await this.apply(code, (order) => order.rejectBudget()),
    );
  }

  averageExecutionTime(): Promise<{ minutes: number; count: number }> {
    return this.orders.averageExecutionMinutes();
  }

  private assertStockAvailable(part: PartEntity, requested: number): void {
    if (part.stock - requested < (part.minimumStock ?? 0)) {
      throw new BadRequestException(
        'Insufficient stock: the remaining stock would fall below the minimum stock',
      );
    }
  }

  private syncItems(entity: WorkOrderEntity, order: WorkOrder): void {
    entity.items = order.itemsSnapshot.map((item) =>
      Object.assign(new WorkOrderItemEntity(), {
        kind: item.kind,
        referenceId: item.referenceId,
        description: item.description,
        unitPriceInCents: item.unitPrice.cents,
        quantity: item.quantity.value,
      }),
    );
  }

  private async apply(
    code: string,
    change: (order: WorkOrder) => void,
    consumesStock = false,
  ): Promise<WorkOrderResponseDto> {
    const entity = await this.findOrFail(code);
    const order = this.toDomain(entity);
    change(order);
    this.sync(entity, order);
    entity.history.push(
      Object.assign(new WorkOrderHistoryEntity(), { status: order.status }),
    );
    if (consumesStock) {
      await this.orders.saveApproved(entity, this.partConsumption(order));
    } else {
      await this.orders.save(entity);
    }
    return this.getByCode(code);
  }

  private async findOrFail(code: string): Promise<WorkOrderEntity> {
    const entity = await this.orders.findByCode(code);
    if (!entity) throw new NotFoundException('Work order not found');
    return entity;
  }

  private toProgress(order: WorkOrderResponseDto) {
    const { code, status, budgetStatus, history } = order;
    return { code, status, budgetStatus, history };
  }

  private partConsumption(order: WorkOrder): Map<string, number> {
    const requested = new Map<string, number>();
    for (const item of order.itemsSnapshot.filter(
      (candidate) => candidate.kind === CatalogItemKindEnum.PART,
    )) {
      requested.set(
        item.referenceId,
        (requested.get(item.referenceId) ?? 0) + item.quantity.value,
      );
    }
    return requested;
  }

  private sync(entity: WorkOrderEntity, order: WorkOrder): void {
    entity.status = order.status;
    entity.budgetStatus = order.budgetStatus;
    entity.totalInCents = order.total.cents;
    entity.executionStartedAt = order.startedAt ?? null;
    entity.executionFinishedAt = order.finishedAt ?? null;
    if (entity.history.length === 0) {
      entity.history.push(
        Object.assign(new WorkOrderHistoryEntity(), { status: order.status }),
      );
    }
  }

  private toDomain(entity: WorkOrderEntity): WorkOrder {
    return WorkOrder.restore({
      id: entity.id,
      code: entity.code,
      customerDocument: Document.create(entity.customer.document),
      vehiclePlate: LicensePlate.create(entity.vehicle.licensePlate),
      items: entity.items.map((item) => ({
        kind: item.kind,
        referenceId: item.referenceId,
        description: item.description,
        unitPrice: Money.fromCents(item.unitPriceInCents),
        quantity: Quantity.create(item.quantity),
      })),
      status: entity.status,
      budgetStatus: entity.budgetStatus,
      total: Money.fromCents(entity.totalInCents),
      createdAt: entity.createdAt,
      executionStartedAt: entity.executionStartedAt ?? undefined,
      executionFinishedAt: entity.executionFinishedAt ?? undefined,
    });
  }

  private toResponse(entity: WorkOrderEntity): WorkOrderResponseDto {
    return {
      id: entity.id,
      code: entity.code,
      customerDocument: entity.customer.document,
      vehiclePlate: entity.vehicle.licensePlate,
      status: entity.status,
      budgetStatus: entity.budgetStatus,
      total: Money.fromCents(entity.totalInCents).toAmount(),
      items: entity.items.map((item) => ({
        kind: item.kind,
        referenceId: item.referenceId,
        description: item.description,
        unitPrice: Money.fromCents(item.unitPriceInCents).toAmount(),
        quantity: item.quantity,
      })),
      history: [...entity.history]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((entry) => ({ status: entry.status, at: entry.createdAt })),
      startedAt: entity.executionStartedAt,
      finishedAt: entity.executionFinishedAt,
      createdAt: entity.createdAt,
    };
  }
}
