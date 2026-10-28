# Auto Repair Service API (MVP)

EN: Auto repair shop back-end MVP for managing service orders, customers, vehicles and parts inventory, built with DDD and a layered monolith.

PT: MVP de back-end para oficina mecânica com gestão de ordens de serviço, clientes, veículos e estoque de peças, usando DDD e monolito em camadas.

## Objetivo

Substituir as anotações manuais e planilhas de uma oficina mecânica de médio porte por um sistema
que organiza o atendimento, o diagnóstico, a execução e a entrega dos veículos, controla o estoque
de peças, mantém o histórico de clientes e veículos e deixa o cliente acompanhar o serviço e
aprovar ou negar o orçamento.

## Solução

- Abertura da OS identificando o cliente por CPF/CNPJ, com veículo, serviços e peças (insumos).
- Orçamento calculado automaticamente e enviado ao cliente por e-mail, com uma página onde ele vê o
  orçamento e escolhe aprovar ou negar.
- Status da OS: Recebida, Em diagnóstico, Aguardando aprovação, Em execução, Finalizada e Entregue,
  com regras de transição e histórico.
- Consulta pública do andamento pelo código da OS.
- CRUD de clientes, veículos, serviços e peças; controle de estoque por movimentações (entrada,
  saída e ajuste) e estoque mínimo.
- Listagem e detalhe das OS e tempo médio de execução.
- Autenticação JWT para as rotas administrativas.

## Arquitetura

Monolito em camadas, organizado por funcionalidade:

```
Controller (HTTP, validação, Swagger, JWT)
   → Service (casos de uso)
      → Domínio (WorkOrder e objetos de valor, sem dependência de framework)
      → Repository (TypeORM) → PostgreSQL
```

- `src/apis/<funcionalidade>`: módulo, controller, service e repository de cada contexto.
- `src/core`: domínio, entidades, DTOs, enums, guard, filtro de exceções, e-mail, templates (e-mail e página do orçamento) e a migration inicial.
- O agregado `WorkOrder` concentra as regras da OS; os fluxos que mexem em estoque rodam em
  transação.

Detalhes e o mapeamento entre a documentação DDD e o código estão em
[docs/ddd/mapeamento-codigo.md](docs/ddd/mapeamento-codigo.md).

## Tecnologias

TypeScript, Node.js 20.11+, NestJS, TypeORM, PostgreSQL 15, JWT (`@nestjs/jwt`), bcrypt,
class-validator, Swagger (`@nestjs/swagger`), Helmet, Nodemailer, Jest e Supertest, oxlint, Docker
e Docker Compose.

## Banco de dados: PostgreSQL

Escolhido por:

- **Transações e consistência**: aprovar um orçamento baixa o estoque, registra a saída e grava a OS
  de uma vez; o PostgreSQL garante esse tudo-ou-nada.
- **Concorrência**: bloqueio de linha (`SELECT ... FOR UPDATE`) evita que duas aprovações usem o
  mesmo saldo de peça.
- **Integridade relacional**: chaves estrangeiras (`RESTRICT`), unicidade de documento, placa e
  código da OS, e `CHECK` impedindo saldo ou preço negativos.
- **Consultas**: cálculo do tempo médio de execução direto em SQL.
- Os dados são fortemente relacionais (cliente, veículo, OS, itens, peças), o que favorece um banco
  relacional em vez de um banco de documentos.

## Pré-requisitos

- Node.js 20.11 ou superior (`nvm use` lê o `.nvmrc`)
- Docker e Docker Compose

## Execução

Copie `.env.example` para `.env`. As variáveis `JWT_SECRET`, `ADMIN_EMAIL` e
`ADMIN_PASSWORD` são obrigatórias: a API não sobe sem elas.

**Tudo com Docker** (banco e API):

```sh
cp .env.example .env
docker compose up -d --build
```

**API local com o banco no Docker**:

```sh
cp .env.example .env     # ajuste DB_HOST=localhost
docker compose up -d postgres
npm ci
npm run start:dev
```

No `.env.example`, `DB_HOST=postgres` serve para a API dentro do Compose; para rodar a API fora do
Docker, use `DB_HOST=localhost`. As migrations rodam sozinhas ao iniciar.

A API fica em `http://localhost:3000`.

### E-mail do orçamento

`POST /work-order/:code/send-budget` envia o orçamento ao e-mail do cliente da OS. Configure no seu
`.env` (nunca no repositório) `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
`SMTP_PASSWORD` e `EMAIL_FROM` com os dados do seu provedor de e-mail. `APP_PUBLIC_URL` é a base
dos links do e-mail. Com `SMTP_HOST` vazio, o e-mail é gerado mas não é enviado, e a API registra um
aviso no log.

## Testes

```sh
npm test            # testes unitários
npm run test:cov    # unitários com relatório de cobertura em coverage/
npm run build && npm run test:e2e   # integração (precisa do PostgreSQL no ar)
```

- A cobertura mínima de 80% é exigida nos domínios críticos (`src/core/domain`); o comando
  `npm run test:cov` falha se ela cair abaixo disso.
- Os testes de integração sobem a aplicação completa contra o PostgreSQL (`docker compose up -d
  postgres` com `DB_HOST=localhost`) e precisam do build, porque as migrations são lidas de `dist/`.
- Mais detalhes em [docs/quality/coverage.md](docs/quality/coverage.md) e
  [docs/security/security.md](docs/security/security.md).

## Swagger

Com a API no ar, acesse `http://localhost:3000/docs`. Para testar as rotas protegidas, faça o login
em `POST /auth/login` e use o token no botão **Authorize**.

## Autenticação

`POST /auth/login` com o e-mail e a senha configurados em `ADMIN_EMAIL` e
`ADMIN_PASSWORD` devolve um JWT (`accessToken`). O `.env.example` traz valores de
demonstração para essas variáveis; troque-os em qualquer ambiente real. O token expira após o tempo
de `JWT_EXPIRATION` (por exemplo `1d` ou `2h`; um número puro vale segundos; padrão `1d`). Envie o
token no cabeçalho `Authorization: Bearer <token>`.

## API

Rotas protegidas por JWT:

| Recurso | Rotas |
|---|---|
| Clientes | `POST`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id` em `/customer` |
| Veículos | o mesmo CRUD em `/vehicle` |
| Serviços | o mesmo CRUD em `/service` |
| Peças | o mesmo CRUD em `/part` |
| Estoque | `POST /inventory` |
| Ordens de serviço | `/work-order` (abrir, listar, detalhar, itens, status, envio do orçamento, métrica) |

Ordem de serviço:

- `POST /work-order` abre a OS (`customerDocument` e `vehiclePlate`).
- `POST /work-order/:code/item` inclui uma peça ou serviço; uma peça só entra se o saldo restante
  ficar igual ou acima do `minimumStock`.
- `DELETE /work-order/:code/item/:referenceId?quantity=n` remove uma quantidade do item.
- `POST /work-order/:code/:action` muda o status; `:action` é o status gravado no banco:
  `EM_DIAGNOSTICO`, `AGUARDANDO_APROVACAO`, `FINALIZADA` ou `ENTREGUE`.
- `POST /work-order/:code/send-budget` envia o orçamento por e-mail (a OS precisa estar aguardando
  aprovação).
- `GET /work-order/metrics/average-execution-time` devolve o tempo médio de execução.

Estoque: `POST /inventory` recebe `partId`, `type`, `quantity` e `reason`. `ENTRY` soma ao saldo,
`EXIT` retira dele e `ADJUSTMENT` define o saldo como `quantity`, ignorando o anterior.

Rotas públicas (sem token, identificadas só pelo código da OS):

- `GET /public/work-order/:code` devolve o andamento.
- `GET /public/work-order/:code/budget` mostra o orçamento (veículo, itens e total) com os botões de
  aprovar e negar. É o link do e-mail; a decisão só vale no `POST` do botão, para que leitores de
  link do e-mail não decidam sem querer.
- `POST /public/work-order/:code/approve` aprova o orçamento e inicia a execução.
- `POST /public/work-order/:code/deny` nega o orçamento e devolve a OS ao diagnóstico.

## Estrutura de diretórios

```
src/
  main.ts                 inicialização (Helmet, validação, Swagger)
  app/                    módulo raiz
  apis/
    auth/                 login e JWT
    customer/  vehicle/   cadastro de clientes e veículos
    service/   part/      catálogo de serviços e peças
    inventory/            movimentações de estoque
    work-order/           ordens de serviço
    public/               acompanhamento e resposta ao orçamento pelo cliente
  core/
    domain/               WorkOrder, objetos de valor e erro de domínio
    entities/             entidades do banco
    dtos/  enums/         contratos de entrada e saída, enumerações
    database/             data source e migration inicial
    guards/  filters/     JWT e tratamento de erros
    email/                envio do orçamento
    templates/            HTML do e-mail e da página do orçamento
test/
  unit/                   testes unitários
  *.e2e-spec.ts           testes de integração
docs/
  ddd/                    event storming (PDF), diagramas C4 (PDF), linguagem ubíqua e mapeamento
  quality/  security/     cobertura e segurança
```

## Documentação DDD

- [Event Storming no Miro](https://miro.com/app/board/uXjVEa9LEbQ=/?share_link_id=39615751943)
- [Event Storming (PDF)](docs/ddd/event-storming.pdf)
- [Diagramas C4, níveis 1 a 3 (PDF)](docs/ddd/diagramas.pdf)
- [Linguagem ubíqua e glossário](docs/ddd/linguagem-ubiqua.md)
- [Mapeamento entre a documentação e o código](docs/ddd/mapeamento-codigo.md)

## Vídeo da entrega

[Vídeo da entrega no YouTube](https://www.youtube.com/watch?v=XH7MrXWnILc)
