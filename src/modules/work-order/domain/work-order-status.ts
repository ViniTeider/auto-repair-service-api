export enum WorkOrderStatus {
  RECEIVED = 'RECEBIDA',
  IN_DIAGNOSIS = 'EM_DIAGNOSTICO',
  AWAITING_APPROVAL = 'AGUARDANDO_APROVACAO',
  IN_EXECUTION = 'EM_EXECUCAO',
  FINISHED = 'FINALIZADA',
  DELIVERED = 'ENTREGUE',
}

export enum WorkOrderAction {
  START_DIAGNOSIS = 'diagnosis',
  FINISH_DIAGNOSIS = 'finish-diagnosis',
  APPROVE_BUDGET = 'approve',
  REJECT_BUDGET = 'reject',
  FINISH_EXECUTION = 'finish',
  DELIVER = 'deliver',
}

export enum BudgetStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
