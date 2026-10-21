import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/apis/auth/auth.service';
import { CustomerApplicationService } from '../../src/apis/customer/services/customer-application.service';
import { InventoryApplicationService } from '../../src/apis/inventory/services/inventory-application.service';
import { ServiceApplicationService } from '../../src/apis/service/services/service-application.service';
import { WorkOrderApplicationService } from '../../src/apis/work-order/services/work-order-application.service';
import { WorkOrderActionEnum } from '../../src/core/enums/work-order/work-order-action.enum';
import { CatalogItemKindEnum } from '../../src/core/enums/catalog-item-kind.enum';

describe('Application services', () => {
  const createServices = () => {
    const auth = new AuthService(new JwtService({ secret: 'test-secret' }));
    const customers = new CustomerApplicationService();
    const inventory = new InventoryApplicationService();
    const services = new ServiceApplicationService();
    const workOrders = new WorkOrderApplicationService(
      customers,
      inventory,
      services,
    );
    return { auth, customers, inventory, services, workOrders };
  };

  it('authenticates the configured admin and rejects invalid credentials', async () => {
    const { auth } = createServices();
    await expect(
      auth.login('admin@repair-shop.com', 'AdminSecurePassword123!'),
    ).resolves.toHaveProperty('accessToken');
    await expect(auth.login('admin@repair-shop.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('opens a public-trackable work order with independent vehicle data', () => {
    const { customers, workOrders } = createServices();
    customers.createCustomer({
      document: '529.982.247-25',
      name: 'Maria',
      email: 'maria@example.com',
      phone: '11999999999',
    });
    customers.createVehicle({
      licensePlate: 'ABC-1234',
      make: 'Ford',
      model: 'Ka',
      year: 2020,
    });
    const order = workOrders.open({
      customerDocument: '529.982.247-25',
      vehiclePlate: 'ABC-1234',
    });
    expect(workOrders.get(order.code.value, '52998224725').status).toBe(
      'RECEBIDA',
    );
  });

  it('requires and consumes stock when approving a budget', () => {
    const { customers, inventory, workOrders } = createServices();
    customers.createCustomer({
      document: '529.982.247-25',
      name: 'Maria',
      email: 'maria@example.com',
      phone: '11999999999',
    });
    customers.createVehicle({
      licensePlate: 'ABC-1234',
      make: 'Ford',
      model: 'Ka',
      year: 2020,
    });
    const part = inventory.createPart({
      name: 'Oil filter',
      price: 20,
      minimumStock: 1,
      stock: 1,
    });
    const order = workOrders.open({
      customerDocument: '529.982.247-25',
      vehiclePlate: 'ABC-1234',
    });
    workOrders.addItem(order.code.value, {
      kind: CatalogItemKindEnum.PART,
      referenceId: part.id,
      quantity: 1,
    });
    workOrders.transition(
      order.code.value,
      WorkOrderActionEnum.START_DIAGNOSIS,
    );
    workOrders.transition(
      order.code.value,
      WorkOrderActionEnum.FINISH_DIAGNOSIS,
    );
    workOrders.transition(order.code.value, WorkOrderActionEnum.APPROVE_BUDGET);
    expect(inventory.listParts()[0].stock).toBe(0);
  });
});
