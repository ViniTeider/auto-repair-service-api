import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovementTypeEnum } from '../../core/enums/stock-movement-type.enum';
import { PartEntity } from '../../core/entities/part.entity';
import { StockMovementEntity } from '../../core/entities/stock-movement.entity';
import { WorkOrderEntity } from '../../core/entities/work-order.entity';

const RELATIONS = { customer: true, vehicle: true, items: true, history: true };

@Injectable()
export class WorkOrderRepository {
  constructor(
    @InjectRepository(WorkOrderEntity)
    private readonly repository: Repository<WorkOrderEntity>,
  ) {}

  findAll(): Promise<WorkOrderEntity[]> {
    return this.repository.find({
      relations: RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  findByCode(code: string): Promise<WorkOrderEntity | null> {
    return this.repository.findOne({ where: { code }, relations: RELATIONS });
  }

  save(order: WorkOrderEntity): Promise<WorkOrderEntity> {
    return this.repository.save(order);
  }

  // Approving a budget consumes stock; both must succeed or fail together.
  saveApproved(
    order: WorkOrderEntity,
    consumption: Map<string, number>,
  ): Promise<WorkOrderEntity> {
    return this.repository.manager.transaction(async (manager) => {
      for (const [partId, quantity] of consumption) {
        const part = await manager.findOne(PartEntity, {
          where: { id: partId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!part || part.stock - quantity < (part.minimumStock ?? 0)) {
          throw new BadRequestException(
            'Insufficient stock: the remaining stock would fall below the minimum stock',
          );
        }
        part.stock -= quantity;
        await manager.save(part);
        await manager.save(
          Object.assign(new StockMovementEntity(), {
            partId,
            quantity,
            type: StockMovementTypeEnum.EXIT,
            reason: 'Budget approval',
            workOrderId: order.id,
          }),
        );
      }
      return manager.save(order);
    });
  }

  async averageExecutionMinutes(): Promise<{ minutes: number; count: number }> {
    const row = await this.repository
      .createQueryBuilder('workOrder')
      .select('COUNT(*)', 'count')
      .addSelect(
        'AVG(EXTRACT(EPOCH FROM (workOrder.executionFinishedAt - workOrder.executionStartedAt)) / 60)',
        'minutes',
      )
      .where('workOrder.executionStartedAt IS NOT NULL')
      .andWhere('workOrder.executionFinishedAt IS NOT NULL')
      .getRawOne<{ count: string; minutes: string | null }>();
    return {
      minutes: Number(row?.minutes ?? 0),
      count: Number(row?.count ?? 0),
    };
  }
}
