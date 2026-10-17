import { DomainError } from '../../../shared/domain/domain-error';
import { Document } from '../../../shared/domain/value-objects/document';
import { LicensePlate } from '../../../shared/domain/value-objects/license-plate';
import { Money } from '../../../shared/domain/value-objects/money';
import { Quantity } from '../../../shared/domain/value-objects/quantity';
import { WorkOrderCode } from '../../../shared/domain/value-objects/work-order-code';
import { BudgetStatus, WorkOrderStatus } from './work-order-status';

export type WorkOrderHistoryEntry = {
  status: WorkOrderStatus;
  at: Date;
};

export type WorkOrderItem = {
  kind: 'SERVICE' | 'PART';
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
    private statusValue: WorkOrderStatus,
    private budgetStatusValue: BudgetStatus,
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
      WorkOrderStatus.RECEIVED,
      BudgetStatus.PENDING,
      Money.fromCents(0),
      new Date(),
    );
  }

  get status(): WorkOrderStatus {
    return this.statusValue;
  }

  get budgetStatus(): BudgetStatus {
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
    if (![WorkOrderStatus.RECEIVED, WorkOrderStatus.IN_DIAGNOSIS].includes(this.statusValue)) {
      throw new DomainError('Items can only be changed before budget approval');
    }
    this.items.push(item);
    this.recalculateBudget();
  }

  removeItem(referenceId: string): void {
    if (![WorkOrderStatus.RECEIVED, WorkOrderStatus.IN_DIAGNOSIS].includes(this.statusValue)) {
      throw new DomainError('Items can only be changed before budget approval');
    }
    this.items = this.items.filter((item) => item.referenceId !== referenceId);
    this.recalculateBudget();
  }

  startDiagnosis(): void {
    this.transition(WorkOrderStatus.IN_DIAGNOSIS, [WorkOrderStatus.RECEIVED]);
  }

  finishDiagnosis(): void {
    this.transition(WorkOrderStatus.AWAITING_APPROVAL, [WorkOrderStatus.IN_DIAGNOSIS]);
    if (this.items.length === 0) throw new DomainError('At least one item is required');
  }

  sendBudget(): void {
    if (this.statusValue !== WorkOrderStatus.AWAITING_APPROVAL || this.items.length === 0) {
      throw new DomainError('Budget can only be sent for an order awaiting approval with items');
    }
  }

  approveBudget(): void {
    this.transition(WorkOrderStatus.IN_EXECUTION, [WorkOrderStatus.AWAITING_APPROVAL]);
    this.budgetStatusValue = BudgetStatus.APPROVED;
    this.executionStartedAt = new Date();
  }

  rejectBudget(): void {
    if (this.statusValue !== WorkOrderStatus.AWAITING_APPROVAL) {
      throw new DomainError('Only an awaiting budget can be rejected');
    }
    this.budgetStatusValue = BudgetStatus.REJECTED;
    this.statusValue = WorkOrderStatus.IN_DIAGNOSIS;
  }

  finishExecution(): void {
    this.transition(WorkOrderStatus.FINISHED, [WorkOrderStatus.IN_EXECUTION]);
    this.executionFinishedAt = new Date();
  }

  deliver(): void {
    this.transition(WorkOrderStatus.DELIVERED, [WorkOrderStatus.FINISHED]);
  }

  private recalculateBudget(): void {
    this.totalValue = this.items.reduce(
      (total, item) => total.add(item.unitPrice.multiply(item.quantity.value)),
      Money.fromCents(0),
    );
    this.budgetStatusValue = BudgetStatus.PENDING;
  }

  private transition(target: WorkOrderStatus, allowed: WorkOrderStatus[]): void {
    if (!allowed.includes(this.statusValue)) {
      throw new DomainError(`Invalid work order transition from ${this.statusValue} to ${target}`);
    }
    this.statusValue = target;
  }
}

export type StoredWorkOrder = WorkOrder & {
  history: WorkOrderHistoryEntry[];
};
