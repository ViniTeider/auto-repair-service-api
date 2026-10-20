import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkOrderRepository } from '../repository/work-order.repository';

@Injectable()
export class WorkOrderService {
  constructor(private readonly orders: WorkOrderRepository) {}

  list() {
    return this.orders.findAll();
  }

  async getByCode(code: string) {
    const order = await this.orders.findByCode(code);
    if (!order) throw new NotFoundException('Work order not found');
    return order;
  }
}
