# Auto Repair Service API (MVP)
EN: Auto repair shop back-end MVP for managing service orders, customers, vehicles and parts inventory, built with DDD and a layered monolith.  

PT: MVP de back-end para oficina mecânica com gestão de ordens de serviço, clientes, veículos e estoque de peças, usando DDD e monolito em camadas.

## Running locally

Copy `.env.example` to `.env`, start PostgreSQL with `docker compose up -d postgres`,
use Node.js 20.11 or newer (`nvm use` reads the included `.nvmrc`), install
dependencies with `npm ci`, and run the API with `npm run start:dev`.
Swagger is available at `/docs`.

## Tests

Use `npm test` for the unit suite and `npm run test:cov` for the coverage report.
The project uses Jest with TypeScript ESM and PostgreSQL is the target integration
database exposed by `docker-compose.yml`.

## API

`POST /auth/login` returns a JWT for the admin credentials set in `.env`
(`ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD`, both required, as is `JWT_SECRET`).
All routes except login and the public ones below require `Authorization: Bearer <token>`:
`/customer`, `/vehicle`, `/part`, `/service`, `/inventory` and `/work-order`
(including `/work-order/metrics/average-execution-time`).

`POST /work-order/:code/:action` moves a work order to a new status; `:action` is the
status saved in the database: `EM_DIAGNOSTICO`, `AGUARDANDO_APROVACAO`, `FINALIZADA` or `ENTREGUE`.

Work order items: `POST /work-order/:code/item` adds a part or service and
`DELETE /work-order/:code/item/:referenceId?quantity=n` removes a quantity of it. A part can
only be added if the remaining stock stays at or above its `minimumStock`.

Stock: `POST /inventory` registers a movement for a part (`partId`, `type`, `quantity`, `reason`):
`ENTRY` adds to the balance, `EXIT` removes from it and `ADJUSTMENT` sets the balance to
`quantity`, ignoring the previous one.

Budget: `POST /work-order/:code/send-budget` (body `customerDocument`) emails the customer the
budget with approve and deny buttons. It needs the order awaiting approval. Configure `SMTP_*`,
`EMAIL_FROM` and `APP_PUBLIC_URL` in `.env`; without `SMTP_HOST` the email is not delivered.

Public routes (no token, identified only by the work order code):

- `GET /public/work-order/:code` returns the current progress.
- `GET /public/work-order/:code/approve` and `/deny` show a confirmation page (the email links);
  the decision is made by the `POST` of its form, so link scanners cannot decide by accident.
- `POST /public/work-order/:code/approve` approves the budget and starts execution.
- `POST /public/work-order/:code/deny` denies the budget and returns the order to diagnosis.
