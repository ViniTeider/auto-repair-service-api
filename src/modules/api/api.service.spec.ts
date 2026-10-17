import { JwtService } from '@nestjs/jwt';
import { ApiService } from './api.service';
import { WorkOrderAction } from '../work-order/domain/work-order-status';

describe('ApiService', () => {
  const createService = () => new ApiService(new JwtService({ secret: 'test-secret' }));

  it('authenticates the configured admin and rejects invalid credentials', async () => {
    const service = createService();
    await expect(service.login('admin@repair-shop.com', 'AdminSecurePassword123!')).resolves.toHaveProperty('accessToken');
    await expect(service.login('admin@repair-shop.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('opens a public-trackable work order with independent vehicle data', () => {
    const service = createService();
    service.createCustomer({ document: '529.982.247-25', name: 'Maria', email: 'maria@example.com', phone: '11999999999' });
    service.createVehicle({ licensePlate: 'ABC-1234', make: 'Ford', model: 'Ka', year: 2020 });
    const order = service.openOrder({ customerDocument: '529.982.247-25', vehiclePlate: 'ABC-1234' });
    expect(service.getOrder(order.code.value, '52998224725').status).toBe('RECEBIDA');
  });

  it('requires and consumes stock when approving a budget', () => {
    const service = createService();
    service.createCustomer({ document: '529.982.247-25', name: 'Maria', email: 'maria@example.com', phone: '11999999999' });
    service.createVehicle({ licensePlate: 'ABC-1234', make: 'Ford', model: 'Ka', year: 2020 });
    const part = service.createPart({ name: 'Oil filter', price: 20, minimumStock: 1, stock: 1 });
    const order = service.openOrder({ customerDocument: '529.982.247-25', vehiclePlate: 'ABC-1234' });
    service.addOrderItem(order.code.value, { kind: 'PART', referenceId: part.id, quantity: 1 });
    service.transition(order.code.value, WorkOrderAction.START_DIAGNOSIS);
    service.transition(order.code.value, WorkOrderAction.FINISH_DIAGNOSIS);
    service.transition(order.code.value, WorkOrderAction.APPROVE_BUDGET);
    expect(service.list([part])[0].stock).toBe(0);
  });
});
