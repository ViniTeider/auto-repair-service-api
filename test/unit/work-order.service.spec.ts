import { jest } from '@jest/globals';
import { WorkOrderService } from '../../src/apis/work-order/work-order.service';
import { CatalogItemKindEnum } from '../../src/core/enums/catalog-item-kind.enum';
import { WorkOrderActionEnum } from '../../src/core/enums/work-order/work-order-action.enum';
import { WorkOrderEntity } from '../../src/core/entities/work-order.entity';

describe('WorkOrderService', () => {
  const customer = {
    id: 'customer-1',
    document: '52998224725',
    name: 'Maria',
    email: 'maria@example.com',
  };
  const vehicle = {
    id: 'vehicle-1',
    licensePlate: 'ABC1234',
    make: 'Ford',
    model: 'Ka',
    year: 2020,
  };
  const part = {
    id: 'part-1',
    name: 'Oil filter',
    price: 2000,
    stock: 10,
    minimumStock: 2,
  };

  const createService = () => {
    let stored: WorkOrderEntity | null = null;
    const persist = async (entity: WorkOrderEntity) => {
      entity.createdAt ??= new Date();
      entity.history.forEach((entry) => (entry.createdAt ??= new Date()));
      stored = entity;
      return entity;
    };
    const orders = {
      findByCode: jest.fn(async () => stored),
      save: jest.fn(persist),
      saveApproved: jest.fn(persist),
    };
    const customers = {
      findByDocument: jest.fn(async (document: string) =>
        document === customer.document ? customer : null,
      ),
    };
    const vehicles = {
      findByLicensePlate: jest.fn(async (plate: string) =>
        plate === vehicle.licensePlate ? vehicle : null,
      ),
    };
    const parts = {
      findById: jest.fn(async (id: string) => (id === part.id ? part : null)),
    };
    const services = { findById: jest.fn(async () => null) };
    const email = { sendBudgetEmail: jest.fn(async () => undefined) };
    const service = new WorkOrderService(
      orders as never,
      customers as never,
      vehicles as never,
      parts as never,
      services as never,
      email as never,
    );
    return { service, orders, email };
  };

  const open = async (service: WorkOrderService) => {
    const opened = await service.open({
      customerDocument: '529.982.247-25',
      vehiclePlate: 'abc-1234',
    });
    // the repository mock does not fill relations, so attach them like TypeORM would
    return opened;
  };

  it('rejects unknown customers and vehicles', async () => {
    const { service } = createService();
    await expect(
      service.open({
        customerDocument: '111.444.777-35',
        vehiclePlate: 'ABC-1234',
      }),
    ).rejects.toThrow('Customer not found');
    await expect(
      service.open({
        customerDocument: '529.982.247-25',
        vehiclePlate: 'XYZ-9876',
      }),
    ).rejects.toThrow('Vehicle not found');
  });

  it('opens an order, prices items in cents and approves with stock consumption', async () => {
    const { service, orders } = createService();
    const opened = await open(service);
    expect(opened.status).toBe('RECEBIDA');

    const withItem = await service.addItem(opened.code, {
      kind: CatalogItemKindEnum.PART,
      referenceId: part.id,
      quantity: 2,
    });
    expect(withItem.total).toBe(40);

    await service.transition(opened.code, WorkOrderActionEnum.START_DIAGNOSIS);
    await service.transition(opened.code, WorkOrderActionEnum.FINISH_DIAGNOSIS);
    const approved = await service.approve(opened.code);

    expect(approved.status).toBe('EM_EXECUCAO');
    expect(orders.saveApproved).toHaveBeenCalledWith(
      expect.anything(),
      new Map([[part.id, 2]]),
    );
  });

  it('does not find unknown orders', async () => {
    const { service } = createService();
    await expect(service.getByCode('OS-UNKNOWN')).rejects.toThrow(
      'Work order not found',
    );
  });

  it('refuses items that would leave the stock below the minimum', async () => {
    const { service } = createService();
    const opened = await open(service);
    // 10 in stock with a minimum of 2: at most 8 units can be used
    await service.addItem(opened.code, {
      kind: CatalogItemKindEnum.PART,
      referenceId: part.id,
      quantity: 8,
    });
    await expect(
      service.addItem(opened.code, {
        kind: CatalogItemKindEnum.PART,
        referenceId: part.id,
        quantity: 1,
      }),
    ).rejects.toThrow('minimum stock');
  });

  it('removes a quantity of an item, validating what exists in the order', async () => {
    const { service } = createService();
    const opened = await open(service);
    await service.addItem(opened.code, {
      kind: CatalogItemKindEnum.PART,
      referenceId: part.id,
      quantity: 3,
    });
    await expect(service.removeItem(opened.code, part.id, 4)).rejects.toThrow(
      'Quantity exceeds',
    );
    await expect(
      service.removeItem(opened.code, 'other-part', 1),
    ).rejects.toThrow('Item not found');
    const updated = await service.removeItem(opened.code, part.id, 2);
    expect(updated.items).toEqual([
      expect.objectContaining({ referenceId: part.id, quantity: 1 }),
    ]);
    expect(updated.total).toBe(20);
  });

  it('sends the budget email to the order customer only when awaiting approval', async () => {
    const { service, email } = createService();
    const opened = await open(service);
    await service.addItem(opened.code, {
      kind: CatalogItemKindEnum.PART,
      referenceId: part.id,
      quantity: 1,
    });
    await expect(service.sendBudget(opened.code)).rejects.toThrow(
      'awaiting approval',
    );

    await service.transition(opened.code, WorkOrderActionEnum.START_DIAGNOSIS);
    await service.transition(opened.code, WorkOrderActionEnum.FINISH_DIAGNOSIS);
    await expect(service.sendBudget(opened.code)).resolves.toEqual({
      message: 'Budget email sent',
    });
    expect(email.sendBudgetEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'maria@example.com', code: opened.code }),
    );
  });

  it('exposes the budget details for the public page', async () => {
    const { service } = createService();
    const opened = await open(service);
    await service.addItem(opened.code, {
      kind: CatalogItemKindEnum.PART,
      referenceId: part.id,
      quantity: 2,
    });
    await expect(service.getBudget(opened.code)).resolves.toEqual(
      expect.objectContaining({
        code: opened.code,
        total: 40,
        vehicle: expect.objectContaining({
          make: 'Ford',
          licensePlate: 'ABC1234',
        }),
        items: [
          expect.objectContaining({ description: 'Oil filter', quantity: 2 }),
        ],
      }),
    );
  });
});
