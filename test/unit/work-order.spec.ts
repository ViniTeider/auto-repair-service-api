import { Document } from '../../src/shared/domain/value-objects/document';
import { LicensePlate } from '../../src/shared/domain/value-objects/license-plate';
import { Money } from '../../src/shared/domain/value-objects/money';
import { Quantity } from '../../src/shared/domain/value-objects/quantity';
import { DomainError } from '../../src/shared/domain/domain-error';
import { WorkOrder } from '../../src/modules/work-order/entity/work-order';
import { WorkOrderStatus } from '../../src/modules/work-order/entity/work-order-status';

describe('WorkOrder', () => {
  const createOrder = () => WorkOrder.open({
    id: 'wo-1',
    customerDocument: Document.create('529.982.247-25'),
    vehiclePlate: LicensePlate.create('ABC-1234'),
  });

  it('calculates the budget and follows the lifecycle', () => {
    const order = createOrder();
    order.addItem({
      kind: 'SERVICE',
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
    expect(order.status).toBe(WorkOrderStatus.IN_EXECUTION);
    expect(order.startedAt).toBeInstanceOf(Date);
    order.finishExecution();
    expect(order.finishedAt).toBeInstanceOf(Date);
    order.deliver();
    expect(order.status).toBe(WorkOrderStatus.DELIVERED);
  });

  it('returns a rejected budget to diagnosis', () => {
    const order = createOrder();
    order.addItem({
      kind: 'PART',
      referenceId: 'part-1',
      description: 'Filter',
      unitPrice: Money.fromAmount(20),
      quantity: Quantity.create(1),
    });
    order.startDiagnosis();
    order.finishDiagnosis();
    order.rejectBudget();
    expect(order.status).toBe(WorkOrderStatus.IN_DIAGNOSIS);
  });

  it('rejects invalid transitions and item changes after approval', () => {
    const order = createOrder();
    expect(() => order.finishExecution()).toThrow(DomainError);
    order.addItem({
      kind: 'SERVICE',
      referenceId: 'service-1',
      description: 'Alignment',
      unitPrice: Money.fromAmount(80),
      quantity: Quantity.create(1),
    });
    order.startDiagnosis();
    order.finishDiagnosis();
    order.approveBudget();
    expect(() => order.removeItem('service-1')).toThrow(DomainError);
  });

  it('requires items before finishing diagnosis and supports budget sending', () => {
    const empty = createOrder();
    empty.startDiagnosis();
    expect(() => empty.finishDiagnosis()).toThrow(DomainError);
    const order = createOrder();
    order.addItem({
      kind: 'SERVICE',
      referenceId: 'service-1',
      description: 'Brake check',
      unitPrice: Money.fromAmount(50),
      quantity: Quantity.create(1),
    });
    order.startDiagnosis();
    order.removeItem('service-1');
    expect(order.itemsSnapshot).toHaveLength(0);
    order.addItem({
      kind: 'SERVICE',
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
});
