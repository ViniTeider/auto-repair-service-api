import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleEntity } from '../../../core/entities/vehicle.entity';

@Injectable()
export class VehicleRepository {
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly repository: Repository<VehicleEntity>,
  ) {}

  findAll(): Promise<VehicleEntity[]> {
    return this.repository.find();
  }

  findById(id: string): Promise<VehicleEntity | null> {
    return this.repository.findOneBy({ id });
  }

  save(vehicle: VehicleEntity): Promise<VehicleEntity> {
    return this.repository.save(vehicle);
  }
}
