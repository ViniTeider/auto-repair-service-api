# Auto Repair Service API (MVP)
EN: Auto repair shop back-end MVP for managing service orders, customers, vehicles and parts inventory, built with DDD and a layered monolith.  

PT: MVP de back-end para oficina mecânica com gestão de ordens de serviço, clientes, veículos e estoque de peças, usando DDD e monolito em camadas.

## Running locally

Copy `.env.example` to `.env`, start PostgreSQL with `docker compose up -d postgres`,
install dependencies with `npm ci`, and run the API with `npm run start:dev`.
Swagger is available at `/docs`.

## Tests

Use `npm test` for the unit suite and `npm run test:cov` for the coverage report.
The project uses Jest with TypeScript ESM and PostgreSQL is the target integration
database exposed by `docker-compose.yml`.

## API

`POST /auth/login` returns a JWT for the configured admin seed credentials.
Administrative routes under `/admin/*` require `Authorization: Bearer <token>`.
Public progress lookup is available at
`GET /public/work-orders/:code?document=<cpf-or-cnpj>`.
