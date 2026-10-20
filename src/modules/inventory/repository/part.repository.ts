import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from '../entity/part.entity';

@Injectable()
export class PartRepository {
  constructor(
    @InjectRepository(Part)
    private readonly repository: Repository<Part>,
  ) {}

  findAll(): Promise<Part[]> {
    return this.repository.find();
  }

  findById(id: string): Promise<Part | null> {
    return this.repository.findOneBy({ id });
  }

  save(part: Part): Promise<Part> {
    return this.repository.save(part);
  }
}
