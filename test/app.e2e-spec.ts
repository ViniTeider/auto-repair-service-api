import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('rejects unauthenticated administrative requests', () => {
    return request(app.getHttpServer()).get('/admin/customers').expect(401);
  });

  it('executes the complete repair-order application flow', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@repair-shop.com',
        password: 'AdminSecurePassword123!',
      })
      .expect(201);

    const token = loginResponse.body.accessToken as string;
    const admin = { Authorization: `Bearer ${token}` };

    const customerResponse = await request(app.getHttpServer())
      .post('/admin/customers')
      .set(admin)
      .send({
        document: '529.982.247-25',
        name: 'Maria Silva',
        email: 'maria@example.com',
        phone: '11999999999',
      })
      .expect(201);

    const vehicleResponse = await request(app.getHttpServer())
      .post('/admin/vehicles')
      .set(admin)
      .send({
        licensePlate: 'ABC-1234',
        make: 'Ford',
        model: 'Ka',
        year: 2020,
      })
      .expect(201);

    const serviceResponse = await request(app.getHttpServer())
      .post('/admin/services')
      .set(admin)
      .send({
        name: 'Oil change',
        description: 'Engine oil replacement',
        price: 100,
      })
      .expect(201);

    const partResponse = await request(app.getHttpServer())
      .post('/admin/parts')
      .set(admin)
      .send({
        name: 'Oil filter',
        price: 20,
        minimumStock: 1,
        stock: 2,
      })
      .expect(201);

    const workOrderResponse = await request(app.getHttpServer())
      .post('/admin/work-orders')
      .set(admin)
      .send({
        customerDocument: customerResponse.body.document,
        vehiclePlate: vehicleResponse.body.licensePlate,
      })
      .expect(201);

    const workOrderCode = workOrderResponse.body.code as string;

    await request(app.getHttpServer())
      .post(`/admin/work-orders/${workOrderCode}/items`)
      .set(admin)
      .send({
        kind: 'SERVICE',
        referenceId: serviceResponse.body.id,
        quantity: 1,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/admin/work-orders/${workOrderCode}/items`)
      .set(admin)
      .send({
        kind: 'PART',
        referenceId: partResponse.body.id,
        quantity: 1,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/admin/work-orders/${workOrderCode}/diagnosis`)
      .set(admin)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/admin/work-orders/${workOrderCode}/finish-diagnosis`)
      .set(admin)
      .expect(201);

    const approvedOrderResponse = await request(app.getHttpServer())
      .post(`/admin/work-orders/${workOrderCode}/approve`)
      .set(admin)
      .expect(201);

    expect(approvedOrderResponse.body.status).toBe('EM_EXECUCAO');

    const inventoryResponse = await request(app.getHttpServer())
      .get('/admin/parts')
      .set(admin)
      .expect(200);

    expect(inventoryResponse.body).toEqual([
      expect.objectContaining({
        id: partResponse.body.id,
        stock: 1,
      }),
    ]);

    await request(app.getHttpServer())
      .post(`/admin/work-orders/${workOrderCode}/finish`)
      .set(admin)
      .expect(201);

    const deliveredOrderResponse = await request(app.getHttpServer())
      .post(`/admin/work-orders/${workOrderCode}/deliver`)
      .set(admin)
      .expect(201);

    expect(deliveredOrderResponse.body.status).toBe('ENTREGUE');

    const publicProgressResponse = await request(app.getHttpServer())
      .get(`/public/work-orders/${workOrderCode}`)
      .query({ document: customerResponse.body.document })
      .expect(200);

    expect(publicProgressResponse.body).toEqual(
      expect.objectContaining({
        code: workOrderCode,
        status: 'ENTREGUE',
      }),
    );

    await request(app.getHttpServer())
      .get('/admin/customers')
      .set(admin)
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual([
          expect.objectContaining({ id: customerResponse.body.id }),
        ]);
      });

    await request(app.getHttpServer())
      .get('/admin/metrics/average-execution-time')
      .set(admin)
      .expect(200)
      .expect((response) => {
        expect(response.body.count).toBe(1);
        expect(response.body.minutes).toBeGreaterThanOrEqual(0);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
