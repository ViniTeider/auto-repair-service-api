import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entity/vehicle.entity';

@Injectable()
export class VehicleRepository {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repository: Repository<Vehicle>,
  ) {}

  findAll(): Promise<Vehicle[]> {
    return this.repository.find();
  }

  findById(id: string): Promise<Vehicle | null> {
    return this.repository.findOneBy({ id });
  }

  save(vehicle: Vehicle): Promise<Vehicle> {
    return this.repository.save(vehicle);
  }
}
