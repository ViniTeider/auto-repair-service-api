import { Document } from '../../src/core/domain/value-objects/document.value-object';
import { LicensePlate } from '../../src/core/domain/value-objects/license-plate.value-object';
import { Money } from '../../src/core/domain/value-objects/money.value-object';
import { Quantity } from '../../src/core/domain/value-objects/quantity.value-object';
import { DomainError } from '../../src/core/domain/domain-error';
import { WorkOrder } from '../../src/core/domain/work-order.domain';
import { WorkOrderStatusEnum } from '../../src/core/enums/work-order/work-order-status.enum';
import { CatalogItemKindEnum } from '../../src/core/enums/catalog-item-kind.enum';

describe('WorkOrder', () => {
  const createOrder = () =>
    WorkOrder.open({
      id: 'wo-1',
      customerDocument: Document.create('529.982.247-25'),
      vehiclePlate: LicensePlate.create('ABC-1234'),
    });

  it('calculates the budget and follows the lifecycle', () => {
    const order = createOrder();
    order.addItem({
      kind: CatalogItemKindEnum.SERVICE,
      referenceId: 'service-1',
      description: 'Oil change',
      unitPrice: Money.fromAmount(100),
      quantity: Quantity.create(1),
    });
    order.startDiagnosis();
    order.finishDiagnosis();
    expect(order.total.toAmount()).toBe(100);
    expect(order.budgetStatus).toBe('PENDING');
    expect(order.itemsSnapshot).toHaveLength(1);
    order.approveBudget();
    expect(order.status).toBe(WorkOrderStatusEnum.IN_EXECUTION);
    expect(order.startedAt).toBeInstanceOf(Date);
    order.finishExecution();
    expect(order.finishedAt).toBeInstanceOf(Date);
    order.deliver();
    expect(order.status).toBe(WorkOrderStatusEnum.DELIVERED);
  });

  it('returns a rejected budget to diagnosis', () => {
    const order = createOrder();
    order.addItem({
      kind: CatalogItemKindEnum.PART,
      referenceId: 'part-1',
      description: 'Filter',
      unitPrice: Money.fromAmount(20),
      quantity: Quantity.create(1),
    });
    order.startDiagnosis();
    order.finishDiagnosis();
    order.rejectBudget();
    expect(order.status).toBe(WorkOrderStatusEnum.IN_DIAGNOSIS);
  });

  it('rejects invalid transitions and item changes after approval', () => {
    const order = createOrder();
    expect(() => order.finishExecution()).toThrow(DomainError);
    order.addItem({
      kind: CatalogItemKindEnum.SERVICE,
      referenceId: 'service-1',
      description: 'Alignment',
      unitPrice: Money.fromAmount(80),
      quantity: Quantity.create(1),
    });
    order.startDiagnosis();
    order.finishDiagnosis();
    order.approveBudget();
    expect(() => order.removeItem('service-1', Quantity.create(1))).toThrow(
      DomainError,
    );
  });

  it('requires items before finishing diagnosis and supports budget sending', () => {
    const empty = createOrder();
    empty.startDiagnosis();
    expect(() => empty.finishDiagnosis()).toThrow(DomainError);
    const order = createOrder();
    order.addItem({
      kind: CatalogItemKindEnum.SERVICE,
      referenceId: 'service-1',
      description: 'Brake check',
      unitPrice: Money.fromAmount(50),
      quantity: Quantity.create(1),
    });
    order.startDiagnosis();
    order.removeItem('service-1', Quantity.create(1));
    expect(order.itemsSnapshot).toHaveLength(0);
    order.addItem({
      kind: CatalogItemKindEnum.SERVICE,
      referenceId: 'service-1',
      description: 'Brake check',
      unitPrice: Money.fromAmount(50),
      quantity: Quantity.create(1),
    });
    order.finishDiagnosis();
    expect(() => order.sendBudget()).not.toThrow();
    order.rejectBudget();
    expect(() => order.approveBudget()).toThrow(DomainError);
  });

  it('removes part of an item quantity and validates the amount', () => {
    const order = createOrder();
    const item = {
      kind: CatalogItemKindEnum.PART,
      referenceId: 'part-1',
      description: 'Filter',
      unitPrice: Money.fromAmount(20),
      quantity: Quantity.create(2),
    };
    order.addItem(item);
    order.addItem({ ...item, quantity: Quantity.create(1) });
    expect(order.total.toAmount()).toBe(60);

    expect(() => order.removeItem('part-2', Quantity.create(1))).toThrow(
      'Item not found in the work order',
    );
    expect(() => order.removeItem('part-1', Quantity.create(4))).toThrow(
      'Quantity exceeds the amount in the work order',
    );

    order.removeItem('part-1', Quantity.create(2));
    expect(order.total.toAmount()).toBe(20);
    expect(order.itemsSnapshot).toHaveLength(1);
    order.removeItem('part-1', Quantity.create(1));
    expect(order.itemsSnapshot).toHaveLength(0);
  });
});
