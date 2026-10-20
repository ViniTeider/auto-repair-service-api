import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrderEntity } from '../../../database/entities';

@Injectable()
export class WorkOrderRepository {
  constructor(
    @InjectRepository(WorkOrderEntity)
    private readonly repository: Repository<WorkOrderEntity>,
  ) {}

  findAll(): Promise<WorkOrderEntity[]> {
    return this.repository.find();
  }

  findByCode(code: string): Promise<WorkOrderEntity | null> {
    return this.repository.findOneBy({ code });
  }

  save(order: WorkOrderEntity): Promise<WorkOrderEntity> {
    return this.repository.save(order);
  }
}
