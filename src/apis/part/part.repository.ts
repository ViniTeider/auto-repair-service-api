import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartEntity } from '../../core/entities/part.entity';

@Injectable()
export class PartRepository {
  constructor(
    @InjectRepository(PartEntity)
    private readonly repository: Repository<PartEntity>,
  ) {}

  findAll(): Promise<PartEntity[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<PartEntity | null> {
    return this.repository.findOneBy({ id });
  }

  findByName(name: string): Promise<PartEntity | null> {
    return this.repository.findOneBy({ name });
  }

  save(entity: PartEntity): Promise<PartEntity> {
    return this.repository.save(entity);
  }

  async remove(entity: PartEntity): Promise<void> {
    await this.repository.remove(entity);
  }
}
