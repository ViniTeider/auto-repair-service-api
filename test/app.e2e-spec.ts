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
        email: 'admin@repair-shop.com',
        password: 'AdminSecurePassword123!',
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
        stock: 2,
      })
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
      .post(`/work-order/${code}/items`)
      .set(auth)
      .send({ kind: 'SERVICE', referenceId: service.body.id, quantity: 1 })
      .expect(201);
    const withItems = await request(http)
      .post(`/work-order/${code}/items`)
      .set(auth)
      .send({ kind: 'PART', referenceId: part.body.id, quantity: 1 })
      .expect(201);
    expect(withItems.body.total).toBe(120);
    expect(withItems.body.items).toHaveLength(2);

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
      .post(`/public/work-order/${code}/approve`)
      .expect(201)
      .expect((response) => {
        expect(response.body.status).toBe('EM_EXECUCAO');
        expect(response.body.budgetStatus).toBe('APPROVED');
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
      email: 'admin@repair-shop.com',
      password: 'AdminSecurePassword123!',
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
      .post(`/work-order/${code}/items`)
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
      .send({ name: `Brake pad ${suffix}`, price: 50, stock: 0 });
    const order = await request(http).post('/work-order').set(auth).send({
      customerDocument: customer.body.document,
      vehiclePlate: vehicle.body.licensePlate,
    });
    const code = order.body.code as string;

    await request(http)
      .post(`/work-order/${code}/items`)
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
