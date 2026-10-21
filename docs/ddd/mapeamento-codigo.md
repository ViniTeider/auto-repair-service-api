# Mapeamento entre a documentação DDD e o código

Como cada conceito de [linguagem-ubiqua.md](./linguagem-ubiqua.md) aparece na implementação.
Os caminhos são relativos à raiz do repositório.

## Arquitetura em camadas

O sistema é um monólito NestJS organizado por funcionalidade (`src/apis/<contexto>`) com um núcleo
compartilhado (`src/core`).

| Camada | Responsabilidade | Onde fica |
|---|---|---|
| Apresentação | Rotas HTTP, validação de entrada, Swagger, autenticação | `src/apis/*/*.controller.ts`, `src/core/dtos`, `src/core/guards`, `src/core/filters` |
| Aplicação | Orquestra os casos de uso e traduz erros em respostas | `src/apis/*/*.service.ts` |
| Domínio | Regras de negócio, sem dependência de framework | `src/core/domain` |
| Infraestrutura | Persistência, e-mail e migrations | `src/apis/*/*.repository.ts`, `src/core/entities`, `src/core/database`, `src/core/email`, `src/core/templates` |

Fluxo de uma requisição: controller → service → (domínio) → repository → PostgreSQL.

## Bounded Contexts

Os contextos são módulos do mesmo monólito, cada um em sua pasta de `src/apis`.

| Contexto | Módulos | Responsabilidade |
|---|---|---|
| Ordem de Serviço | `work-order`, `public` | Abertura, itens, orçamento, status e acompanhamento da OS |
| Cadastro | `customer`, `vehicle` | Clientes e veículos |
| Catálogo | `service`, `part` | Serviços e peças, com seus preços |
| Estoque | `inventory` | Movimentações e saldo das peças |
| Identidade | `auth` | Login do administrador e JWT |

O contexto Ordem de Serviço depende de Cadastro, Catálogo e Estoque lendo os repositórios deles.
O estoque só é alterado diretamente pelo contexto Estoque; a aprovação do orçamento também o
altera, dentro da transação da OS.

## Agregados, entidades e objetos de valor

| Conceito DDD | Elemento | Código |
|---|---|---|
| Agregado raiz | Ordem de Serviço | `src/core/domain/work-order.domain.ts` (`WorkOrder`) |
| Objeto de valor | Item da OS | tipo `WorkOrderItem` em `src/core/domain/work-order.domain.ts` |
| Objeto de valor | Documento (CPF/CNPJ) | `src/core/domain/value-objects/document.value-object.ts` |
| Objeto de valor | Placa | `src/core/domain/value-objects/license-plate.value-object.ts` |
| Objeto de valor | Ano do veículo | `src/core/domain/value-objects/vehicle-year.value-object.ts` |
| Objeto de valor | Dinheiro (em centavos) | `src/core/domain/value-objects/money.value-object.ts` |
| Objeto de valor | Quantidade | `src/core/domain/value-objects/quantity.value-object.ts` |
| Objeto de valor | Código da OS | `src/core/domain/value-objects/work-order-code.value-object.ts` |
| Erro de domínio | Violação de regra | `src/core/domain/domain-error.ts` (vira HTTP 422 em `src/core/filters/http-exception.filter.ts`) |
| Entidade de persistência | Cliente, veículo, serviço, peça | `src/core/entities/{customer,vehicle,service,part}.entity.ts` |
| Entidade de persistência | OS, itens, histórico | `src/core/entities/work-order{,-item,-history}.entity.ts` |
| Entidade de persistência | Movimentação de estoque | `src/core/entities/stock-movement.entity.ts` |
| Enumerações | Status, ação, situação do orçamento, tipo de item e de movimentação | `src/core/enums` |

O agregado `WorkOrder` é reconstruído a partir das entidades (`WorkOrder.restore`) a cada operação,
recebe a mudança pelos métodos de domínio e é gravado de volta. Quem faz essa tradução é
`src/apis/work-order/work-order.service.ts` (`toDomain` e `sync`).

## Comandos → endpoints

| Comando | Rota | Controller → método de domínio ou serviço |
|---|---|---|
| Abrir OS | `POST /work-order` | `WorkOrderService.open` → `WorkOrder.open` |
| Incluir item | `POST /work-order/:code/item` | `WorkOrderService.addItem` → `WorkOrder.addItem` |
| Remover item | `DELETE /work-order/:code/item/:referenceId` | `WorkOrderService.removeItem` → `WorkOrder.removeItem` |
| Iniciar diagnóstico | `POST /work-order/:code/EM_DIAGNOSTICO` | `WorkOrder.startDiagnosis` |
| Concluir diagnóstico | `POST /work-order/:code/AGUARDANDO_APROVACAO` | `WorkOrder.finishDiagnosis` |
| Enviar orçamento | `POST /work-order/:code/send-budget` | `WorkOrderService.sendBudget` → `WorkOrder.sendBudget`, `EmailService.sendBudgetEmail` |
| Aprovar orçamento | `POST /public/work-order/:code/approve` | `WorkOrderService.approve` → `WorkOrder.approveBudget`, `WorkOrderRepository.saveApproved` |
| Negar orçamento | `POST /public/work-order/:code/deny` | `WorkOrderService.deny` → `WorkOrder.rejectBudget` |
| Finalizar execução | `POST /work-order/:code/FINALIZADA` | `WorkOrder.finishExecution` |
| Entregar | `POST /work-order/:code/ENTREGUE` | `WorkOrder.deliver` |
| Registrar movimentação | `POST /inventory` | `InventoryService.move` → `InventoryRepository.move` |
| CRUD de cliente, veículo, serviço e peça | `/customer`, `/vehicle`, `/service`, `/part` | `*.controller.ts` → `*.service.ts` → `*.repository.ts` |
| Entrar | `POST /auth/login` | `AuthService.login` |

## Consultas

| Consulta | Rota | Código |
|---|---|---|
| Listar e detalhar OS | `GET /work-order`, `GET /work-order/:code` | `WorkOrderService.list`, `getByCode` |
| Tempo médio de execução | `GET /work-order/metrics/average-execution-time` | `WorkOrderRepository.averageExecutionMinutes` (SQL) |
| Acompanhar OS | `GET /public/work-order/:code` | `WorkOrderService.getProgress` |
| Página do orçamento | `GET /public/work-order/:code/budget` | `WorkOrderService.getBudget`, `src/core/templates/budget-page.template.ts` |

## Políticas (regras) → onde estão

| Regra | Onde |
|---|---|
| Transições de status permitidas | `WorkOrder.transition` e os métodos `startDiagnosis`, `finishDiagnosis`, `approveBudget`, `rejectBudget`, `finishExecution`, `deliver` |
| Itens só editáveis antes da aprovação | `WorkOrder.assertItemsEditable` |
| Recalcular o total e voltar o orçamento a `PENDING` | `WorkOrder.recalculateBudget` |
| Diagnóstico exige itens; orçamento só é enviado com itens | `WorkOrder.finishDiagnosis`, `WorkOrder.sendBudget` |
| Quantidade removida não passa do que existe | `WorkOrder.removeItem` |
| CPF/CNPJ e placa válidos | `Document.create`, `LicensePlate.create` |
| Documento e placa únicos | `CustomerService`, `VehicleService` (HTTP 409) e restrições `UNIQUE` do banco |
| Saldo nunca negativo; ajuste define o saldo | `InventoryService.nextBalance` |
| Estoque mínimo ao incluir peça | `WorkOrderService.assertStockAvailable` |
| Estoque mínimo ao aprovar | `WorkOrderRepository.saveApproved` |
| Cliente ou veículo com OS não pode ser apagado | `isForeignKeyViolation` em `src/core/utils/database-error.util.ts` e chave estrangeira `RESTRICT` |

## Eventos de domínio → onde são registrados

Os eventos não são classes. Cada um deixa um registro no banco:

| Evento | Registro |
|---|---|
| OS aberta, diagnóstico iniciado, orçamento pronto, orçamento aprovado ou negado, execução finalizada, veículo entregue | Nova linha em `work_order_history` (`WorkOrderHistoryEntity`) a cada mudança de status |
| Orçamento aprovado ou negado | `budgetStatus` da OS |
| Início e fim da execução | `executionStartedAt` e `executionFinishedAt` da OS |
| Entrada, saída ou ajuste de estoque | Linha em `stock_movement` (`StockMovementEntity`) |

## Transações

| Fluxo | Garantia |
|---|---|
| Aprovar orçamento | `WorkOrderRepository.saveApproved`: trava as peças, confere o estoque, baixa o saldo, registra a saída e grava a OS, tudo na mesma transação |
| Registrar movimentação | `InventoryRepository.move`: trava a peça e grava o novo saldo e a movimentação juntos |
| Gravar a OS | O `save` do TypeORM grava a OS, os itens e o histórico juntos |

## Autenticação

`JwtAuthGuard` (`src/core/guards/jwt-auth.guard.ts`) protege todos os controllers administrativos.
O login confere o e-mail e a senha definidos no `.env` (`ADMIN_EMAIL` e
`ADMIN_PASSWORD`) e assina o token com `JWT_SECRET`. As rotas `/public/work-order` e
`/auth/login` são as únicas abertas.

## Testes que cobrem cada parte

| Elemento | Teste |
|---|---|
| Objetos de valor | `test/unit/value-objects.spec.ts` |
| Agregado `WorkOrder` | `test/unit/work-order.spec.ts` |
| Fluxos da OS, estoque mínimo, remoção de item, orçamento | `test/unit/work-order.service.spec.ts` |
| Login | `test/unit/auth.service.spec.ts` |
| Fluxo completo da OS, aprovação e negação públicas, estoque | `test/app.e2e-spec.ts` |
| CRUDs e movimentações de estoque | `test/persisted-crud.e2e-spec.ts` |
