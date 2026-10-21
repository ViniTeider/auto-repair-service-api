import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/apis/auth/auth.service';
import { CustomerApplicationService } from '../../src/apis/customer/services/customer-application.service';
import { PartApplicationService } from '../../src/apis/part/services/part-application.service';
import { ServiceApplicationService } from '../../src/apis/service/services/service-application.service';
import { WorkOrderApplicationService } from '../../src/apis/work-order/services/work-order-application.service';
import { WorkOrderActionEnum } from '../../src/core/enums/work-order/work-order-action.enum';
import { CatalogItemKindEnum } from '../../src/core/enums/catalog-item-kind.enum';

describe('Application services', () => {
  const createServices = () => {
    const auth = new AuthService(new JwtService({ secret: 'test-secret' }));
    const customers = new CustomerApplicationService();
    const parts = new PartApplicationService();
    const services = new ServiceApplicationService();
    const workOrders = new WorkOrderApplicationService(
      customers,
      parts,
      services,
    );
    return { auth, customers, parts, services, workOrders };
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
    const { customers, parts, workOrders } = createServices();
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
    const part = parts.createPart({
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
    expect(parts.listParts()[0].stock).toBe(0);
  });
  it('updates and deletes vehicles, parts and services', () => {
    const { customers, parts, services } = createServices();
    const vehicle = customers.createVehicle({
      licensePlate: 'ABC-1234',
      make: 'Ford',
      model: 'Ka',
      year: 2020,
    });
    customers.createVehicle({
      licensePlate: 'XYZ-9876',
      make: 'Fiat',
      model: 'Uno',
      year: 2019,
    });
    expect(customers.updateVehicle(vehicle.id, { model: 'Fiesta' }).model).toBe(
      'Fiesta',
    );
    expect(() =>
      customers.updateVehicle(vehicle.id, { licensePlate: 'XYZ-9876' }),
    ).toThrow('Vehicle license plate already exists');
    customers.deleteVehicle(vehicle.id);
    expect(() => customers.getVehicle(vehicle.id)).toThrow('Vehicle not found');

    const part = parts.createPart({ name: 'Oil filter', price: 20 });
    expect(parts.updatePart(part.id, { price: 25 }).price).toBe(25);
    parts.deletePart(part.id);
    expect(() => parts.getPart(part.id)).toThrow('Part not found');

    const service = services.create({ name: 'Oil change', price: 100 });
    expect(services.update(service.id, { price: 120 }).price).toBe(120);
    services.remove(service.id);
    expect(() => services.get(service.id)).toThrow('Service not found');
  });
});
