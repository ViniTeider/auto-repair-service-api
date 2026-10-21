import { CatalogItemKindEnum } from '../../enums/catalog-item-kind.enum';
import { BudgetStatusEnum } from '../../enums/work-order/budget-status.enum';
import { WorkOrderStatusEnum } from '../../enums/work-order/work-order-status.enum';

export class WorkOrderItemResponseDto {
  kind!: CatalogItemKindEnum;
  referenceId!: string;
  description!: string;
  unitPrice!: number;
  quantity!: number;
}

export class WorkOrderHistoryResponseDto {
  status!: WorkOrderStatusEnum;
  at!: Date;
}

export class WorkOrderResponseDto {
  id!: string;
  code!: string;
  customerDocument!: string;
  vehiclePlate!: string;
  status!: WorkOrderStatusEnum;
  budgetStatus!: BudgetStatusEnum;
  total!: number;
  items!: WorkOrderItemResponseDto[];
  history!: WorkOrderHistoryResponseDto[];
  startedAt!: Date | null;
  finishedAt!: Date | null;
  createdAt!: Date;
}

export class WorkOrderBudgetVehicleDto {
  licensePlate!: string;
  make!: string;
  model!: string;
  year!: number;
}

export class WorkOrderBudgetDto {
  code!: string;
  vehicle!: WorkOrderBudgetVehicleDto;
  items!: WorkOrderItemResponseDto[];
  total!: number;
  status!: WorkOrderStatusEnum;
  budgetStatus!: BudgetStatusEnum;
  createdAt!: Date;
}
