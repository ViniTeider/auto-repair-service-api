# Linguagem Ubíqua

Vocabulário comum entre a oficina e o código. Cada termo mostra o nome usado na conversa, o nome
no código e, quando existe, o valor gravado no banco. O mapeamento completo com arquivos está em
[mapeamento-codigo.md](./mapeamento-codigo.md).

## Glossário

| Termo (negócio) | No código | Definição |
|---|---|---|
| **Ordem de Serviço (OS)** | `WorkOrder` / `WorkOrderEntity` | Registro do atendimento de um veículo, do recebimento à entrega. É o agregado central. |
| **Código da OS** | `WorkOrderCode` | Identificador legível da OS (`OS-<tempo>-<aleatório>`). É o único dado que o cliente usa para acompanhar e responder ao orçamento. |
| **Cliente** | `CustomerEntity` | Pessoa ou empresa dona do veículo, identificada pelo documento. |
| **Documento** | `Document` | CPF ou CNPJ válido, guardado só com dígitos. |
| **Veículo** | `VehicleEntity` | Veículo atendido: placa, marca, modelo e ano. |
| **Placa** | `LicensePlate` | Placa no formato antigo (`ABC-1234`) ou Mercosul (`ABC1D23`), guardada sem hífen. |
| **Ano do veículo** | `VehicleYear` | Inteiro entre 1886 e o ano atual + 1. |
| **Serviço** | `ServiceEntity` | Mão de obra do catálogo, como troca de óleo ou alinhamento. Tem preço e pode estar ativo ou não. |
| **Peça / Insumo** | `PartEntity` | Item de estoque usado nos reparos. Tem preço, saldo (`stock`) e estoque mínimo (`minimumStock`). |
| **Item da OS** | `WorkOrderItem` / `WorkOrderItemEntity` | Serviço ou peça incluído na OS, com descrição, quantidade e valor unitário copiados no momento da inclusão. |
| **Orçamento** | `total` e `budgetStatus` da OS | Soma dos itens, calculada automaticamente. |
| **Situação do orçamento** | `BudgetStatusEnum` | `PENDING` (aguardando resposta), `APPROVED` ou `REJECTED`. Qualquer mudança nos itens volta para `PENDING`. |
| **Aprovar orçamento** | `approveBudget()` | O cliente autoriza o serviço: a OS entra em execução e as peças saem do estoque. |
| **Negar orçamento** | `rejectBudget()` | O cliente recusa: a OS volta ao diagnóstico, com o orçamento `REJECTED`. |
| **Enviar orçamento** | `sendBudget()` | Disponibilizar o orçamento ao cliente por e-mail. Só é possível com a OS aguardando aprovação e com itens. |
| **Status da OS** | `WorkOrderStatusEnum` | Ver tabela abaixo. |
| **Histórico da OS** | `WorkOrderHistoryEntity` | Linha do tempo de status, com a data de cada mudança. |
| **Tempo médio de execução** | `averageExecutionMinutes()` | Média, em minutos, entre o início e o fim da execução das OS concluídas. |
| **Estoque / Saldo** | `PartEntity.stock` | Quantidade disponível de uma peça. Nunca fica negativa. |
| **Estoque mínimo** | `PartEntity.minimumStock` | Saldo que deve sobrar. Uma OS não pode usar peças se o saldo restante ficar abaixo dele. |
| **Movimentação de estoque** | `StockMovementEntity` | Registro de cada alteração do saldo de uma peça. |
| **Entrada** | `StockMovementTypeEnum.ENTRY` | Soma a quantidade ao saldo. |
| **Saída** | `StockMovementTypeEnum.EXIT` | Retira a quantidade do saldo. Também é gerada quando um orçamento é aprovado. |
| **Ajuste** | `StockMovementTypeEnum.ADJUSTMENT` | Define o saldo como a quantidade informada, ignorando o saldo anterior (contagem de inventário). |
| **Administrador** | `UserRoleEnum.ADMIN` | Usuário da oficina que opera o sistema, autenticado por JWT. Há um único, definido no `.env`. |
| **Acompanhamento** | rotas `/public/work-order` | Consulta pública do andamento pelo cliente, usando só o código da OS. |

## Status da OS

| Nome em português | `WorkOrderStatusEnum` | Valor no banco | Quem faz avançar |
|---|---|---|---|
| Recebida | `RECEIVED` | `RECEBIDA` | Abertura da OS |
| Em diagnóstico | `IN_DIAGNOSIS` | `EM_DIAGNOSTICO` | Administrador (ação `EM_DIAGNOSTICO`), ou o cliente ao negar o orçamento |
| Aguardando aprovação | `AWAITING_APPROVAL` | `AGUARDANDO_APROVACAO` | Administrador (ação `AGUARDANDO_APROVACAO`) |
| Em execução | `IN_EXECUTION` | `EM_EXECUCAO` | Cliente, ao aprovar o orçamento |
| Finalizada | `FINISHED` | `FINALIZADA` | Administrador (ação `FINALIZADA`) |
| Entregue | `DELIVERED` | `ENTREGUE` | Administrador (ação `ENTREGUE`) |

## Event Storming em texto

Eventos de domínio no passado, comandos no imperativo e atores como no dia a dia da oficina.
Os eventos ainda não são classes emitidas pelo código: cada um é registrado como mudança de status
no histórico da OS ou como movimentação de estoque (ver o mapeamento).

### Criação da OS

| Ator | Comando | Evento | Política (regra) |
|---|---|---|---|
| Administrador | Cadastrar cliente | Cliente cadastrado | O documento deve ser um CPF ou CNPJ válido e único. |
| Administrador | Cadastrar veículo | Veículo cadastrado | A placa deve ser válida e única; o ano deve ser válido. |
| Administrador | Abrir OS | OS aberta (status Recebida) | O cliente e o veículo devem existir; o cliente é identificado pelo documento. |
| Administrador | Incluir item | Item incluído; orçamento recalculado | Só antes da aprovação; peça só se o saldo restante ficar acima do estoque mínimo. |
| Administrador | Remover item | Item removido; orçamento recalculado | O item deve estar na OS e a quantidade não pode passar do que já existe. |
| Administrador | Concluir diagnóstico | Orçamento pronto (Aguardando aprovação) | Exige ao menos um item. |
| Administrador | Enviar orçamento | Orçamento enviado ao cliente | A OS deve estar aguardando aprovação. |
| Cliente | Aprovar orçamento | Orçamento aprovado (Em execução) | Baixa o estoque das peças numa única transação. |
| Cliente | Negar orçamento | Orçamento negado (volta a Em diagnóstico) | Só vale com a OS aguardando aprovação. |

### Acompanhamento da OS

| Ator | Comando | Evento | Política (regra) |
|---|---|---|---|
| Administrador | Iniciar diagnóstico | Diagnóstico iniciado | Só a partir de Recebida. |
| Administrador | Finalizar execução | Execução finalizada | Só a partir de Em execução; registra o fim da execução. |
| Administrador | Entregar veículo | Veículo entregue | Só a partir de Finalizada. |
| Cliente | Consultar andamento | (consulta, sem evento) | Basta o código da OS. |
| Administrador | Consultar tempo médio | (consulta, sem evento) | Considera só OS com início e fim de execução. |

### Gestão de peças e insumos

| Ator | Comando | Evento | Política (regra) |
|---|---|---|---|
| Administrador | Cadastrar peça | Peça cadastrada | O nome é único; o saldo começa em zero. |
| Administrador | Registrar entrada | Entrada de estoque registrada | A quantidade deve ser maior que zero. |
| Administrador | Registrar saída | Saída de estoque registrada | Não pode passar do saldo. |
| Administrador | Registrar ajuste | Saldo ajustado | O saldo passa a ser a quantidade informada, inclusive zero. |
| Sistema | (aprovação do orçamento) | Saída de estoque registrada | O saldo restante não pode ficar abaixo do estoque mínimo. |

## Regras de negócio resumidas

- Os itens só mudam enquanto a OS está Recebida ou Em diagnóstico.
- Cada mudança de item recalcula o total e devolve o orçamento a `PENDING`.
- Cada mudança de status entra no histórico.
- O preço do item é o preço do catálogo no momento em que foi incluído.
- Cliente ou veículo referenciado por uma OS não pode ser apagado.
