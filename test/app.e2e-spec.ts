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
    'customer',
    'work-order',
    'work-order/metrics/average-execution-time',
  ])('rejects unauthenticated requests to /%s', (route) => {
    return request(app.getHttpServer()).get(`/${route}`).expect(401);
  });

  it('executes the complete repair-order flow', async () => {
    const http = app.getHttpServer();
    const login = await request(http)
      .post('/auth/login')
      .send({
        email: 'admin@test.local',
        password: 'test-admin-password',
      })
      .expect(201);
    const auth = {
      Authorization: `Bearer ${login.body.accessToken as string}`,
    };
    const suffix = Date.now().toString(36);

    const customer = await request(http)
      .post('/customer')
      .set(auth)
      .send({
        document: randomCpf(),
        name: 'Maria Silva',
        email: 'maria@example.com',
        phone: '11999999999',
      })
      .expect(201);
    const vehicle = await request(http)
      .post('/vehicle')
      .set(auth)
      .send({
        licensePlate: randomPlate(),
        make: 'Ford',
        model: 'Ka',
        year: 2020,
      })
      .expect(201);
    const service = await request(http)
      .post('/service')
      .set(auth)
      .send({
        name: `Oil change ${suffix}`,
        description: 'Engine oil replacement',
        price: 100,
      })
      .expect(201);
    const part = await request(http)
      .post('/part')
      .set(auth)
      .send({
        name: `Oil filter ${suffix}`,
        price: 20,
        minimumStock: 1,
      })
      .expect(201);
    await request(http)
      .post('/inventory')
      .set(auth)
      .send({ partId: part.body.id, type: 'ENTRY', quantity: 2 })
      .expect(201);

    const opened = await request(http)
      .post('/work-order')
      .set(auth)
      .send({
        customerDocument: customer.body.document,
        vehiclePlate: vehicle.body.licensePlate,
      })
      .expect(201);
    const code = opened.body.code as string;
    expect(opened.body.status).toBe('RECEBIDA');

    await request(http)
      .post(`/work-order/${code}/item`)
      .set(auth)
      .send({ kind: 'SERVICE', referenceId: service.body.id, quantity: 1 })
      .expect(201);
    const withItems = await request(http)
      .post(`/work-order/${code}/item`)
      .set(auth)
      .send({ kind: 'PART', referenceId: part.body.id, quantity: 1 })
      .expect(201);
    expect(withItems.body.total).toBe(120);
    expect(withItems.body.items).toHaveLength(2);

    await request(http)
      .post(`/work-order/${code}/send-budget`)
      .set(auth)
      .expect(422);
    await request(http).post(`/work-order/${code}/send-budget`).expect(401);
    await request(http)
      .post(`/work-order/${code}/UNKNOWN`)
      .set(auth)
      .expect(400);
    await request(http)
      .post(`/work-order/${code}/EM_DIAGNOSTICO`)
      .set(auth)
      .expect(201);
    await request(http)
      .post(`/work-order/${code}/AGUARDANDO_APROVACAO`)
      .set(auth)
      .expect(201);
    await request(http)
      .post(`/work-order/${code}/send-budget`)
      .set(auth)
      .expect(201)
      .expect({ message: 'Budget email sent' });
    await request(http)
      .get(`/public/work-order/${code}/budget`)
      .expect(200)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain(code);
        expect(response.text).toContain(`Oil change ${suffix}`);
        expect(response.text).toContain(`Oil filter ${suffix}`);
        expect(response.text).toContain('Ford');
        expect(response.text).toContain(`/public/work-order/${code}/approve`);
        expect(response.text).toContain(`/public/work-order/${code}/deny`);
      });
    await request(http).get('/public/work-order/OS-UNKNOWN/budget').expect(404);
    await request(http)
      .post(`/public/work-order/${code}/approve`)
      .expect(201)
      .expect((response) => {
        expect(response.body.status).toBe('EM_EXECUCAO');
        expect(response.body.budgetStatus).toBe('APPROVED');
      });

    await request(http)
      .get(`/public/work-order/${code}/budget`)
      .expect(200)
      .expect((response) => {
        expect(response.text).not.toContain('method="post"');
        expect(response.text).toContain('EM_EXECUCAO');
      });

    const stocked = await request(http)
      .get(`/part/${part.body.id}`)
      .set(auth)
      .expect(200);
    expect(stocked.body.stock).toBe(1);

    await request(http)
      .post(`/work-order/${code}/FINALIZADA`)
      .set(auth)
      .expect(201);
    const delivered = await request(http)
      .post(`/work-order/${code}/ENTREGUE`)
      .set(auth)
      .expect(201);
    expect(delivered.body.status).toBe('ENTREGUE');

    const progress = await request(http)
      .get(`/public/work-order/${code}`)
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
    await request(http).get('/public/work-order/OS-UNKNOWN').expect(404);

    const metrics = await request(http)
      .get('/work-order/metrics/average-execution-time')
      .set(auth)
      .expect(200);
    expect(metrics.body.count).toBeGreaterThanOrEqual(1);
    expect(metrics.body.minutes).toBeGreaterThanOrEqual(0);

    // the customer is now referenced by a work order and cannot be deleted
    await request(http)
      .delete(`/customer/${customer.body.id}`)
      .set(auth)
      .expect(409);
  });

  it('lets the customer deny a budget and returns the order to diagnosis', async () => {
    const http = app.getHttpServer();
    const login = await request(http).post('/auth/login').send({
      email: 'admin@test.local',
      password: 'test-admin-password',
    });
    const auth = {
      Authorization: `Bearer ${login.body.accessToken as string}`,
    };
    const suffix = Date.now().toString(36);

    const customer = await request(http).post('/customer').set(auth).send({
      document: randomCpf(),
      name: 'Ana',
      email: 'ana@example.com',
      phone: '11977777777',
    });
    const vehicle = await request(http).post('/vehicle').set(auth).send({
      licensePlate: randomPlate(),
      make: 'VW',
      model: 'Gol',
      year: 2018,
    });
    const service = await request(http)
      .post('/service')
      .set(auth)
      .send({ name: `Alignment ${suffix}`, price: 80 });
    const order = await request(http).post('/work-order').set(auth).send({
      customerDocument: customer.body.document,
      vehiclePlate: vehicle.body.licensePlate,
    });
    const code = order.body.code as string;

    await request(http).post(`/public/work-order/${code}/deny`).expect(422);
    await request(http)
      .post(`/work-order/${code}/item`)
      .set(auth)
      .send({ kind: 'SERVICE', referenceId: service.body.id, quantity: 1 })
      .expect(201);
    await request(http)
      .post(`/work-order/${code}/EM_DIAGNOSTICO`)
      .set(auth)
      .expect(201);
    await request(http)
      .post(`/work-order/${code}/AGUARDANDO_APROVACAO`)
      .set(auth)
      .expect(201);
    await request(http)
      .post(`/public/work-order/${code}/deny`)
      .expect(201)
      .expect((response) => {
        expect(response.body.status).toBe('EM_DIAGNOSTICO');
        expect(response.body.budgetStatus).toBe('REJECTED');
      });
  });

  it('removes items from a work order and enforces the minimum stock', async () => {
    const http = app.getHttpServer();
    const login = await request(http).post('/auth/login').send({
      email: 'admin@test.local',
      password: 'test-admin-password',
    });
    const auth = {
      Authorization: `Bearer ${login.body.accessToken as string}`,
    };
    const suffix = Date.now().toString(36);

    const customer = await request(http).post('/customer').set(auth).send({
      document: randomCpf(),
      name: 'Carla',
      email: 'carla@example.com',
      phone: '11966666666',
    });
    const vehicle = await request(http).post('/vehicle').set(auth).send({
      licensePlate: randomPlate(),
      make: 'Honda',
      model: 'Fit',
      year: 2021,
    });
    const service = await request(http)
      .post('/service')
      .set(auth)
      .send({ name: `Balancing ${suffix}`, price: 60 });
    const part = await request(http)
      .post('/part')
      .set(auth)
      .send({ name: `Tire ${suffix}`, price: 300, minimumStock: 2 });
    await request(http)
      .post('/inventory')
      .set(auth)
      .send({ partId: part.body.id, type: 'ENTRY', quantity: 3 })
      .expect(201);
    const order = await request(http).post('/work-order').set(auth).send({
      customerDocument: customer.body.document,
      vehiclePlate: vehicle.body.licensePlate,
    });
    const code = order.body.code as string;
    const addItem = (kind: string, referenceId: string, quantity: number) =>
      request(http)
        .post(`/work-order/${code}/item`)
        .set(auth)
        .send({ kind, referenceId, quantity });

    // 3 in stock with a minimum of 2: only one unit can leave
    await addItem('PART', part.body.id, 1).expect(201);
    await addItem('PART', part.body.id, 1).expect(400);
    await addItem('SERVICE', service.body.id, 3).expect(201);

    const remove = (referenceId: string, quantity: number | string) =>
      request(http)
        .delete(`/work-order/${code}/item/${referenceId}`)
        .query({ quantity })
        .set(auth);
    await remove(service.body.id, 5).expect(422);
    await remove('00000000-0000-4000-8000-000000000000', 1).expect(422);
    await remove(service.body.id, 0).expect(400);
    await remove('not-a-uuid', 1).expect(400);
    await request(http)
      .delete(`/work-order/${code}/item/${service.body.id}`)
      .expect(401);

    const removed = await remove(service.body.id, 2).expect(200);
    expect(removed.body.total).toBe(360);
    expect(removed.body.items).toEqual([
      expect.objectContaining({ referenceId: part.body.id, quantity: 1 }),
      expect.objectContaining({ referenceId: service.body.id, quantity: 1 }),
    ]);
    const cleared = await remove(part.body.id, 1).expect(200);
    expect(cleared.body.items).toHaveLength(1);
    expect(cleared.body.total).toBe(60);
  });

  it('refuses to approve a budget without enough stock', async () => {
    const http = app.getHttpServer();
    const login = await request(http).post('/auth/login').send({
      email: 'admin@test.local',
      password: 'test-admin-password',
    });
    const auth = {
      Authorization: `Bearer ${login.body.accessToken as string}`,
    };
    const suffix = Date.now().toString(36);

    const customer = await request(http).post('/customer').set(auth).send({
      document: randomCpf(),
      name: 'João',
      email: 'joao@example.com',
      phone: '11988888888',
    });
    const vehicle = await request(http).post('/vehicle').set(auth).send({
      licensePlate: randomPlate(),
      make: 'Fiat',
      model: 'Uno',
      year: 2019,
    });
    const part = await request(http)
      .post('/part')
      .set(auth)
      .send({ name: `Brake pad ${suffix}`, price: 50 });
    await request(http)
      .post('/inventory')
      .set(auth)
      .send({ partId: part.body.id, type: 'ENTRY', quantity: 1 })
      .expect(201);
    const order = await request(http).post('/work-order').set(auth).send({
      customerDocument: customer.body.document,
      vehiclePlate: vehicle.body.licensePlate,
    });
    const code = order.body.code as string;

    await request(http)
      .post(`/work-order/${code}/item`)
      .set(auth)
      .send({ kind: 'PART', referenceId: part.body.id, quantity: 1 })
      .expect(201);
    await request(http)
      .post(`/work-order/${code}/EM_DIAGNOSTICO`)
      .set(auth)
      .expect(201);
    await request(http)
      .post(`/work-order/${code}/AGUARDANDO_APROVACAO`)
      .set(auth)
      .expect(201);
    // the stock leaves after the item was accepted, so the approval must fail
    await request(http)
      .post('/inventory')
      .set(auth)
      .send({ partId: part.body.id, type: 'EXIT', quantity: 1 })
      .expect(201);
    await request(http).post(`/public/work-order/${code}/approve`).expect(400);

    const unchanged = await request(http)
      .get(`/work-order/${code}`)
      .set(auth)
      .expect(200);
    expect(unchanged.body.status).toBe('AGUARDANDO_APROVACAO');
  });

  afterAll(async () => {
    await app.close();
  });
});
