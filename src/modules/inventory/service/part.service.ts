import { Injectable, NotFoundException } from '@nestjs/common';
import { PartRepository } from '../repository/part.repository';

@Injectable()
export class PartService {
  constructor(private readonly parts: PartRepository) {}

  list() {
    return this.parts.findAll();
  }

  async getById(id: string) {
    const part = await this.parts.findById(id);
    if (!part) throw new NotFoundException('Part not found');
    return part;
  }
}
