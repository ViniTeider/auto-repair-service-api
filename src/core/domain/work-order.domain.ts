import { DomainError } from './domain-error';
import { Document } from './value-objects/document.value-object';
import { LicensePlate } from './value-objects/license-plate.value-object';
import { Money } from './value-objects/money.value-object';
import { Quantity } from './value-objects/quantity.value-object';
import { WorkOrderCode } from './value-objects/work-order-code.value-object';
import { CatalogItemKindEnum } from '../enums/catalog-item-kind.enum';
import { BudgetStatusEnum } from '../enums/work-order/budget-status.enum';
import { WorkOrderStatusEnum } from '../enums/work-order/work-order-status.enum';

export type WorkOrderItem = {
  kind: CatalogItemKindEnum;
  referenceId: string;
  description: string;
  unitPrice: Money;
  quantity: Quantity;
};

export class WorkOrder {
  private constructor(
    readonly id: string,
    readonly code: WorkOrderCode,
    readonly customerDocument: Document,
    readonly vehiclePlate: LicensePlate,
    private items: WorkOrderItem[],
    private statusValue: WorkOrderStatusEnum,
    private budgetStatusValue: BudgetStatusEnum,
    private totalValue: Money,
    readonly createdAt: Date,
    private executionStartedAt?: Date,
    private executionFinishedAt?: Date,
  ) {}

  static open(params: {
    id: string;
    customerDocument: Document;
    vehiclePlate: LicensePlate;
  }): WorkOrder {
    return new WorkOrder(
      params.id,
      WorkOrderCode.generate(),
      params.customerDocument,
      params.vehiclePlate,
      [],
      WorkOrderStatusEnum.RECEIVED,
      BudgetStatusEnum.PENDING,
      Money.fromCents(0),
      new Date(),
    );
  }

  static restore(params: {
    id: string;
    code: string;
    customerDocument: Document;
    vehiclePlate: LicensePlate;
    items: WorkOrderItem[];
    status: WorkOrderStatusEnum;
    budgetStatus: BudgetStatusEnum;
    total: Money;
    createdAt: Date;
    executionStartedAt?: Date;
    executionFinishedAt?: Date;
  }): WorkOrder {
    return new WorkOrder(
      params.id,
      WorkOrderCode.create(params.code),
      params.customerDocument,
      params.vehiclePlate,
      [...params.items],
      params.status,
      params.budgetStatus,
      params.total,
      params.createdAt,
      params.executionStartedAt,
      params.executionFinishedAt,
    );
  }

  get status(): WorkOrderStatusEnum {
    return this.statusValue;
  }

  get budgetStatus(): BudgetStatusEnum {
    return this.budgetStatusValue;
  }

  get itemsSnapshot(): readonly WorkOrderItem[] {
    return [...this.items];
  }

  get total(): Money {
    return this.totalValue;
  }

  get startedAt(): Date | undefined {
    return this.executionStartedAt;
  }

  get finishedAt(): Date | undefined {
    return this.executionFinishedAt;
  }

  toJSON(): object {
    return {
      id: this.id,
      code: this.code,
      customerDocument: this.customerDocument,
      vehiclePlate: this.vehiclePlate,
      items: this.items,
      status: this.status,
      budgetStatus: this.budgetStatus,
      total: this.total,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
    };
  }

  addItem(item: WorkOrderItem): void {
    if (
      ![
        WorkOrderStatusEnum.RECEIVED,
        WorkOrderStatusEnum.IN_DIAGNOSIS,
      ].includes(this.statusValue)
    ) {
      throw new DomainError('Items can only be changed before budget approval');
    }
    this.items.push(item);
    this.recalculateBudget();
  }

  removeItem(referenceId: string): void {
    if (
      ![
        WorkOrderStatusEnum.RECEIVED,
        WorkOrderStatusEnum.IN_DIAGNOSIS,
      ].includes(this.statusValue)
    ) {
      throw new DomainError('Items can only be changed before budget approval');
    }
    this.items = this.items.filter((item) => item.referenceId !== referenceId);
    this.recalculateBudget();
  }

  startDiagnosis(): void {
    this.transition(WorkOrderStatusEnum.IN_DIAGNOSIS, [
      WorkOrderStatusEnum.RECEIVED,
    ]);
  }

  finishDiagnosis(): void {
    this.transition(WorkOrderStatusEnum.AWAITING_APPROVAL, [
      WorkOrderStatusEnum.IN_DIAGNOSIS,
    ]);
    if (this.items.length === 0)
      throw new DomainError('At least one item is required');
  }

  sendBudget(): void {
    if (
      this.statusValue !== WorkOrderStatusEnum.AWAITING_APPROVAL ||
      this.items.length === 0
    ) {
      throw new DomainError(
        'Budget can only be sent for an order awaiting approval with items',
      );
    }
  }

  approveBudget(): void {
    this.transition(WorkOrderStatusEnum.IN_EXECUTION, [
      WorkOrderStatusEnum.AWAITING_APPROVAL,
    ]);
    this.budgetStatusValue = BudgetStatusEnum.APPROVED;
    this.executionStartedAt = new Date();
  }

  rejectBudget(): void {
    if (this.statusValue !== WorkOrderStatusEnum.AWAITING_APPROVAL) {
      throw new DomainError('Only an awaiting budget can be rejected');
    }
    this.budgetStatusValue = BudgetStatusEnum.REJECTED;
    this.statusValue = WorkOrderStatusEnum.IN_DIAGNOSIS;
  }

  finishExecution(): void {
    this.transition(WorkOrderStatusEnum.FINISHED, [
      WorkOrderStatusEnum.IN_EXECUTION,
    ]);
    this.executionFinishedAt = new Date();
  }

  deliver(): void {
    this.transition(WorkOrderStatusEnum.DELIVERED, [
      WorkOrderStatusEnum.FINISHED,
    ]);
  }

  private recalculateBudget(): void {
    this.totalValue = this.items.reduce(
      (total, item) => total.add(item.unitPrice.multiply(item.quantity.value)),
      Money.fromCents(0),
    );
    this.budgetStatusValue = BudgetStatusEnum.PENDING;
  }

  private transition(
    target: WorkOrderStatusEnum,
    allowed: WorkOrderStatusEnum[],
  ): void {
    if (!allowed.includes(this.statusValue)) {
      throw new DomainError(
        `Invalid work order transition from ${this.statusValue} to ${target}`,
      );
    }
    this.statusValue = target;
  }
}
