import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CatalogItemKindEnum } from '../../../core/enums/catalog-item-kind.enum';
import { Document } from '../../../core/domain/value-objects/document.value-object';
import { LicensePlate } from '../../../core/domain/value-objects/license-plate.value-object';
import { Money } from '../../../core/domain/value-objects/money.value-object';
import { Quantity } from '../../../core/domain/value-objects/quantity.value-object';
import { CustomerApplicationService } from '../../customer/services/customer-application.service';
import { InventoryApplicationService } from '../../inventory/services/inventory-application.service';
import { ServiceApplicationService } from '../../service/services/service-application.service';
import {
  StoredWorkOrder,
  WorkOrder,
} from '../../../core/domain/work-order.domain';
import { WorkOrderActionEnum } from '../../../core/enums/work-order/work-order-action.enum';

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
    const order = this.orders.find(
      (candidate) => candidate.code.value === code,
    );
    if (
      !order ||
      (document &&
        order.customerDocument.value !== Document.create(document).value)
    ) {
      throw new NotFoundException('Work order not found');
    }
    return order;
  }

  addItem(
    code: string,
    input: { kind: CatalogItemKindEnum; referenceId: string; quantity: number },
  ): StoredWorkOrder {
    const order = this.get(code);
    const source =
      input.kind === CatalogItemKindEnum.SERVICE
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

  transition(code: string, action: WorkOrderActionEnum): StoredWorkOrder {
    const order = this.get(code);
    if (action === WorkOrderActionEnum.START_DIAGNOSIS) order.startDiagnosis();
    if (action === WorkOrderActionEnum.FINISH_DIAGNOSIS)
      order.finishDiagnosis();
    if (action === WorkOrderActionEnum.APPROVE_BUDGET)
      this.approveBudget(order);
    if (action === WorkOrderActionEnum.REJECT_BUDGET) order.rejectBudget();
    if (action === WorkOrderActionEnum.FINISH_EXECUTION)
      order.finishExecution();
    if (action === WorkOrderActionEnum.DELIVER) order.deliver();
    order.history.push({ status: order.status, at: new Date() });
    return order;
  }

  averageExecutionTime(): { minutes: number; count: number } {
    const completed = this.orders.filter(
      (order) => order.startedAt && order.finishedAt,
    );
    const total = completed.reduce(
      (sum, order) =>
        sum + (order.finishedAt!.getTime() - order.startedAt!.getTime()),
      0,
    );
    return {
      minutes: completed.length ? total / completed.length / 60000 : 0,
      count: completed.length,
    };
  }

  private approveBudget(order: StoredWorkOrder): void {
    const requested = new Map<string, number>();
    for (const item of order.itemsSnapshot.filter(
      (candidate) => candidate.kind === CatalogItemKindEnum.PART,
    )) {
      requested.set(
        item.referenceId,
        (requested.get(item.referenceId) ?? 0) + item.quantity.value,
      );
    }
    for (const [partId, quantity] of requested)
      this.inventory.consume(partId, quantity);
    order.approveBudget();
  }
}
