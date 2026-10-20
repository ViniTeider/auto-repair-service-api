import { JwtService } from '@nestjs/jwt';
import { AuthApplicationService } from '../../src/modules/auth/service/auth.application-service';
import { CustomerApplicationService } from '../../src/modules/customer/service/customer.application-service';
import { InventoryApplicationService } from '../../src/modules/inventory/service/inventory.application-service';
import { ServiceApplicationService } from '../../src/modules/service/service/service.application-service';
import { WorkOrderApplicationService } from '../../src/modules/work-order/service/work-order.application-service';
import { WorkOrderAction } from '../../src/modules/work-order/entity/work-order-status';
import { CatalogItemKind } from '../../src/shared/enums/catalog.enums';

describe('Application services', () => {
  const createServices = () => {
    const auth = new AuthApplicationService(new JwtService({ secret: 'test-secret' }));
    const customers = new CustomerApplicationService();
    const inventory = new InventoryApplicationService();
    const services = new ServiceApplicationService();
    const workOrders = new WorkOrderApplicationService(customers, inventory, services);
    return { auth, customers, inventory, services, workOrders };
  };

  it('authenticates the configured admin and rejects invalid credentials', async () => {
    const { auth } = createServices();
    await expect(auth.login('admin@repair-shop.com', 'AdminSecurePassword123!')).resolves.toHaveProperty('accessToken');
    await expect(auth.login('admin@repair-shop.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('opens a public-trackable work order with independent vehicle data', () => {
    const { customers, workOrders } = createServices();
    customers.createCustomer({ document: '529.982.247-25', name: 'Maria', email: 'maria@example.com', phone: '11999999999' });
    customers.createVehicle({ licensePlate: 'ABC-1234', make: 'Ford', model: 'Ka', year: 2020 });
    const order = workOrders.open({ customerDocument: '529.982.247-25', vehiclePlate: 'ABC-1234' });
    expect(workOrders.get(order.code.value, '52998224725').status).toBe('RECEBIDA');
  });

  it('requires and consumes stock when approving a budget', () => {
    const { customers, inventory, workOrders } = createServices();
    customers.createCustomer({ document: '529.982.247-25', name: 'Maria', email: 'maria@example.com', phone: '11999999999' });
    customers.createVehicle({ licensePlate: 'ABC-1234', make: 'Ford', model: 'Ka', year: 2020 });
    const part = inventory.createPart({ name: 'Oil filter', price: 20, minimumStock: 1, stock: 1 });
    const order = workOrders.open({ customerDocument: '529.982.247-25', vehiclePlate: 'ABC-1234' });
    workOrders.addItem(order.code.value, { kind: CatalogItemKind.PART, referenceId: part.id, quantity: 1 });
    workOrders.transition(order.code.value, WorkOrderAction.START_DIAGNOSIS);
    workOrders.transition(order.code.value, WorkOrderAction.FINISH_DIAGNOSIS);
    workOrders.transition(order.code.value, WorkOrderAction.APPROVE_BUDGET);
    expect(inventory.listParts()[0].stock).toBe(0);
  });
});
