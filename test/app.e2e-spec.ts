import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { randomCpf, randomPlate } from './helpers/random-document';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  it.each([
    'customers',
    'work-orders',
    'work-orders/metrics/average-execution-time',
  ])('rejects unauthenticated requests to /%s', (route) => {
    return request(app.getHttpServer()).get(`/${route}`).expect(401);
  });

  it('executes the complete repair-order flow', async () => {
    const http = app.getHttpServer();
    const login = await request(http)
      .post('/auth/login')
      .send({
        email: 'admin@repair-shop.com',
        password: 'AdminSecurePassword123!',
      })
      .expect(201);
    const auth = {
      Authorization: `Bearer ${login.body.accessToken as string}`,
    };
    const suffix = Date.now().toString(36);

    const customer = await request(http)
      .post('/customers')
      .set(auth)
      .send({
        document: randomCpf(),
        name: 'Maria Silva',
        email: 'maria@example.com',
        phone: '11999999999',
      })
      .expect(201);
    const vehicle = await request(http)
      .post('/vehicles')
      .set(auth)
      .send({
        licensePlate: randomPlate(),
        make: 'Ford',
        model: 'Ka',
        year: 2020,
      })
      .expect(201);
    const service = await request(http)
      .post('/services')
      .set(auth)
      .send({
        name: `Oil change ${suffix}`,
        description: 'Engine oil replacement',
        price: 100,
      })
      .expect(201);
    const part = await request(http)
      .post('/parts')
      .set(auth)
      .send({
        name: `Oil filter ${suffix}`,
        price: 20,
        minimumStock: 1,
        stock: 2,
      })
      .expect(201);

    const opened = await request(http)
      .post('/work-orders')
      .set(auth)
      .send({
        customerDocument: customer.body.document,
        vehiclePlate: vehicle.body.licensePlate,
      })
      .expect(201);
    const code = opened.body.code as string;
    expect(opened.body.status).toBe('RECEBIDA');

    await request(http)
      .post(`/work-orders/${code}/items`)
      .set(auth)
      .send({ kind: 'SERVICE', referenceId: service.body.id, quantity: 1 })
      .expect(201);
    const withItems = await request(http)
      .post(`/work-orders/${code}/items`)
      .set(auth)
      .send({ kind: 'PART', referenceId: part.body.id, quantity: 1 })
      .expect(201);
    expect(withItems.body.total).toBe(120);
    expect(withItems.body.items).toHaveLength(2);

    await request(http)
      .post(`/work-orders/${code}/unknown`)
      .set(auth)
      .expect(400);
    await request(http)
      .post(`/work-orders/${code}/diagnosis`)
      .set(auth)
      .expect(201);
    await request(http)
      .post(`/work-orders/${code}/finish-diagnosis`)
      .set(auth)
      .expect(201);
    const approved = await request(http)
      .post(`/work-orders/${code}/approve`)
      .set(auth)
      .expect(201);
    expect(approved.body.status).toBe('EM_EXECUCAO');

    const stocked = await request(http)
      .get(`/parts/${part.body.id}`)
      .set(auth)
      .expect(200);
    expect(stocked.body.stock).toBe(1);

    await request(http)
      .post(`/work-orders/${code}/finish`)
      .set(auth)
      .expect(201);
    const delivered = await request(http)
      .post(`/work-orders/${code}/deliver`)
      .set(auth)
      .expect(201);
    expect(delivered.body.status).toBe('ENTREGUE');

    const progress = await request(http)
      .get(`/public/work-orders/${code}`)
      .query({ document: customer.body.document })
      .expect(200);
    expect(progress.body).toEqual(
      expect.objectContaining({ code, status: 'ENTREGUE' }),
    );
    expect(
      progress.body.history.map((entry: { status: string }) => entry.status),
    ).toEqual([
      'RECEBIDA',
      'EM_DIAGNOSTICO',
      'AGUARDANDO_APROVACAO',
      'EM_EXECUCAO',
      'FINALIZADA',
      'ENTREGUE',
    ]);
    await request(http)
      .get(`/public/work-orders/${code}`)
      .query({ document: randomCpf() })
      .expect(404);

    const metrics = await request(http)
      .get('/work-orders/metrics/average-execution-time')
      .set(auth)
      .expect(200);
    expect(metrics.body.count).toBeGreaterThanOrEqual(1);
    expect(metrics.body.minutes).toBeGreaterThanOrEqual(0);

    // the customer is now referenced by a work order and cannot be deleted
    await request(http)
      .delete(`/customers/${customer.body.id}`)
      .set(auth)
      .expect(409);
  });

  it('refuses to approve a budget without enough stock', async () => {
    const http = app.getHttpServer();
    const login = await request(http).post('/auth/login').send({
      email: 'admin@repair-shop.com',
      password: 'AdminSecurePassword123!',
    });
    const auth = {
      Authorization: `Bearer ${login.body.accessToken as string}`,
    };
    const suffix = Date.now().toString(36);

    const customer = await request(http).post('/customers').set(auth).send({
      document: randomCpf(),
      name: 'João',
      email: 'joao@example.com',
      phone: '11988888888',
    });
    const vehicle = await request(http).post('/vehicles').set(auth).send({
      licensePlate: randomPlate(),
      make: 'Fiat',
      model: 'Uno',
      year: 2019,
    });
    const part = await request(http)
      .post('/parts')
      .set(auth)
      .send({ name: `Brake pad ${suffix}`, price: 50, stock: 0 });
    const order = await request(http).post('/work-orders').set(auth).send({
      customerDocument: customer.body.document,
      vehiclePlate: vehicle.body.licensePlate,
    });
    const code = order.body.code as string;

    await request(http)
      .post(`/work-orders/${code}/items`)
      .set(auth)
      .send({ kind: 'PART', referenceId: part.body.id, quantity: 1 })
      .expect(201);
    await request(http)
      .post(`/work-orders/${code}/diagnosis`)
      .set(auth)
      .expect(201);
    await request(http)
      .post(`/work-orders/${code}/finish-diagnosis`)
      .set(auth)
      .expect(201);
    await request(http)
      .post(`/work-orders/${code}/approve`)
      .set(auth)
      .expect(400);

    const unchanged = await request(http)
      .get(`/work-orders/${code}`)
      .set(auth)
      .expect(200);
    expect(unchanged.body.status).toBe('AGUARDANDO_APROVACAO');
  });

  afterAll(async () => {
    await app.close();
  });
});
