import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { randomCpf, randomPlate } from './helpers/random-document';

describe('Persisted CRUD (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  const suffix = Date.now().toString().slice(-6);

  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const login = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'admin@test.local',
      password: 'test-admin-password',
    });
    token = login.body.accessToken;
  });

  it.each(['customer', 'vehicle', 'part', 'service'])(
    'requires authentication on /%s',
    (route) => {
      return request(app.getHttpServer()).get(`/${route}`).expect(401);
    },
  );

  it('runs the vehicle crud and rejects duplicated plates', async () => {
    const http = app.getHttpServer();
    const plate = randomPlate();
    const created = await request(http)
      .post('/vehicle')
      .set(auth())
      .send({ licensePlate: plate, make: 'Ford', model: 'Ka', year: 2020 })
      .expect(201);
    await request(http)
      .post('/vehicle')
      .set(auth())
      .send({ licensePlate: plate, make: 'Ford', model: 'Ka', year: 2020 })
      .expect(409);
    await request(http)
      .get(`/vehicle/${created.body.id}`)
      .set(auth())
      .expect(200);
    const updated = await request(http)
      .patch(`/vehicle/${created.body.id}`)
      .set(auth())
      .send({ model: 'Fiesta' })
      .expect(200);
    expect(updated.body.model).toBe('Fiesta');
    await request(http)
      .delete(`/vehicle/${created.body.id}`)
      .set(auth())
      .expect(204);
    await request(http)
      .get(`/vehicle/${created.body.id}`)
      .set(auth())
      .expect(404);
  });

  it('runs the part crud storing cents', async () => {
    const http = app.getHttpServer();
    const created = await request(http)
      .post('/part')
      .set(auth())
      .send({ name: `Filter ${suffix}`, price: 20 })
      .expect(201);
    expect(created.body.price).toBe(20);
    await request(http)
      .patch(`/part/${created.body.id}`)
      .set(auth())
      .send({ price: 30 })
      .expect(200);
    const fetched = await request(http)
      .get(`/part/${created.body.id}`)
      .set(auth())
      .expect(200);
    expect(fetched.body.price).toBe(30);
    await request(http)
      .delete(`/part/${created.body.id}`)
      .set(auth())
      .expect(204);
  });

  it('controls the stock with entry, exit and adjustment movements', async () => {
    const http = app.getHttpServer();
    const part = await request(http)
      .post('/part')
      .set(auth())
      .send({ name: `Spark plug ${suffix}`, price: 15 })
      .expect(201);
    const move = (type: string, quantity: number) =>
      request(http)
        .post('/inventory')
        .set(auth())
        .send({ partId: part.body.id, type, quantity });

    expect((await move('ENTRY', 5).expect(201)).body.balance).toBe(5);
    expect((await move('EXIT', 2).expect(201)).body.balance).toBe(3);
    await move('EXIT', 10).expect(400);
    expect((await move('ADJUSTMENT', 1).expect(201)).body.balance).toBe(1);
    expect((await move('ADJUSTMENT', 0).expect(201)).body.balance).toBe(0);
    await move('ENTRY', 0).expect(422);
    await move('UNKNOWN', 1).expect(400);
    await request(http)
      .post('/inventory')
      .set(auth())
      .send({
        partId: '00000000-0000-4000-8000-000000000000',
        type: 'ENTRY',
        quantity: 1,
      })
      .expect(404);

    const fetched = await request(http)
      .get(`/part/${part.body.id}`)
      .set(auth())
      .expect(200);
    expect(fetched.body.stock).toBe(0);
    await request(http).post('/inventory').expect(401);
  });

  it('runs the service and customer crud', async () => {
    const http = app.getHttpServer();
    const service = await request(http)
      .post('/service')
      .set(auth())
      .send({ name: `Oil change ${suffix}`, price: 100 })
      .expect(201);
    await request(http)
      .patch(`/service/${service.body.id}`)
      .set(auth())
      .send({ active: false })
      .expect(200);
    await request(http)
      .delete(`/service/${service.body.id}`)
      .set(auth())
      .expect(204);

    const customer = await request(http)
      .post('/customer')
      .set(auth())
      .send({
        document: randomCpf(),
        name: 'Maria',
        email: 'maria@example.com',
        phone: '11999999999',
      })
      .expect(201);
    expect(customer.body.document).toMatch(/^\d{11}$/);
    await request(http)
      .patch(`/customer/${customer.body.id}`)
      .set(auth())
      .send({ name: 'Maria Silva' })
      .expect(200);
    await request(http)
      .delete(`/customer/${customer.body.id}`)
      .set(auth())
      .expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
