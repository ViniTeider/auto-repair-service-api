// Values match the WorkOrderStatusEnum value the order moves to (as saved in the database).
export enum WorkOrderActionEnum {
  START_DIAGNOSIS = 'EM_DIAGNOSTICO',
  FINISH_DIAGNOSIS = 'AGUARDANDO_APROVACAO',
  FINISH_EXECUTION = 'FINALIZADA',
  DELIVER = 'ENTREGUE',
}
