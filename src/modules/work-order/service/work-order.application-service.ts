import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CatalogItemKind } from '../../../shared/enums/catalog.enums';
import { Document } from '../../../shared/domain/value-objects/document';
import { LicensePlate } from '../../../shared/domain/value-objects/license-plate';
import { Money } from '../../../shared/domain/value-objects/money';
import { Quantity } from '../../../shared/domain/value-objects/quantity';
import { CustomerApplicationService } from '../../customer/service/customer.application-service';
import { InventoryApplicationService } from '../../inventory/service/inventory.application-service';
import { ServiceApplicationService } from '../../service/service/service.application-service';
import { StoredWorkOrder, WorkOrder } from '../entity/work-order';
import { WorkOrderAction } from '../entity/work-order-status';

type OpenOrderInput = { customerDocument: string; vehiclePlate: string };

@Injectable()
export class WorkOrderApplicationService {
  private readonly orders: StoredWorkOrder[] = [];

  constructor(
    private readonly customers: CustomerApplicationService,
    private readonly inventory: InventoryApplicationService,
    private readonly services: ServiceApplicationService,
  ) {}

  list(): StoredWorkOrder[] {
    return [...this.orders];
  }

  open(input: OpenOrderInput): StoredWorkOrder {
    const customerDocument = Document.create(input.customerDocument);
    const vehiclePlate = LicensePlate.create(input.vehiclePlate);
    if (!this.customers.hasCustomer(customerDocument.value)) {
      throw new NotFoundException('Customer not found');
    }
    if (!this.customers.hasVehicle(vehiclePlate.value)) {
      throw new NotFoundException('Vehicle not found');
    }
    const order = WorkOrder.open({
      id: randomUUID(),
      customerDocument,
      vehiclePlate,
    }) as StoredWorkOrder;
    order.history = [{ status: order.status, at: new Date() }];
    this.orders.push(order);
    return order;
  }

  get(code: string, document?: string): StoredWorkOrder {
    const order = this.orders.find((candidate) => candidate.code.value === code);
    if (!order || (document && order.customerDocument.value !== Document.create(document).value)) {
      throw new NotFoundException('Work order not found');
    }
    return order;
  }

  addItem(
    code: string,
    input: { kind: CatalogItemKind; referenceId: string; quantity: number },
  ): StoredWorkOrder {
    const order = this.get(code);
    const source = input.kind === CatalogItemKind.SERVICE
      ? this.services.findById(input.referenceId)
      : this.inventory.findById(input.referenceId);
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
    const order = this.get(code);
    if (action === WorkOrderAction.START_DIAGNOSIS) order.startDiagnosis();
    if (action === WorkOrderAction.FINISH_DIAGNOSIS) order.finishDiagnosis();
    if (action === WorkOrderAction.APPROVE_BUDGET) this.approveBudget(order);
    if (action === WorkOrderAction.REJECT_BUDGET) order.rejectBudget();
    if (action === WorkOrderAction.FINISH_EXECUTION) order.finishExecution();
    if (action === WorkOrderAction.DELIVER) order.deliver();
    order.history.push({ status: order.status, at: new Date() });
    return order;
  }

  averageExecutionTime(): { minutes: number; count: number } {
    const completed = this.orders.filter((order) => order.startedAt && order.finishedAt);
    const total = completed.reduce(
      (sum, order) => sum + (order.finishedAt!.getTime() - order.startedAt!.getTime()),
      0,
    );
    return { minutes: completed.length ? total / completed.length / 60000 : 0, count: completed.length };
  }

  private approveBudget(order: StoredWorkOrder): void {
    const requested = new Map<string, number>();
    for (const item of order.itemsSnapshot.filter((candidate) => candidate.kind === CatalogItemKind.PART)) {
      requested.set(item.referenceId, (requested.get(item.referenceId) ?? 0) + item.quantity.value);
    }
    for (const [partId, quantity] of requested) this.inventory.consume(partId, quantity);
    order.approveBudget();
  }
}
