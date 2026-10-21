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
    return this.repository.find();
  }

  findById(id: string): Promise<PartEntity | null> {
    return this.repository.findOneBy({ id });
  }

  save(part: PartEntity): Promise<PartEntity> {
    return this.repository.save(part);
  }
}
