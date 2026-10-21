import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleEntity } from '../../core/entities/vehicle.entity';

@Injectable()
export class VehicleRepository {
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly repository: Repository<VehicleEntity>,
  ) {}

  findAll(): Promise<VehicleEntity[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<VehicleEntity | null> {
    return this.repository.findOneBy({ id });
  }

  findByLicensePlate(licensePlate: string): Promise<VehicleEntity | null> {
    return this.repository.findOneBy({ licensePlate });
  }

  save(entity: VehicleEntity): Promise<VehicleEntity> {
    return this.repository.save(entity);
  }

  async remove(entity: VehicleEntity): Promise<void> {
    await this.repository.remove(entity);
  }
}
