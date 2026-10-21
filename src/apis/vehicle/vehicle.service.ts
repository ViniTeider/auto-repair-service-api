import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LicensePlate } from '../../core/domain/value-objects/license-plate.value-object';
import { VehicleYear } from '../../core/domain/value-objects/vehicle-year.value-object';
import { CreateVehicleDto } from '../../core/dtos/vehicle/create-vehicle.dto';
import { UpdateVehicleDto } from '../../core/dtos/vehicle/update-vehicle.dto';
import { VehicleEntity } from '../../core/entities/vehicle.entity';
import { isForeignKeyViolation } from '../../core/utils/database-error.util';
import { VehicleRepository } from './vehicle.repository';

@Injectable()
export class VehicleService {
  constructor(private readonly vehicles: VehicleRepository) {}

  async create(dto: CreateVehicleDto): Promise<VehicleEntity> {
    const licensePlate = LicensePlate.create(dto.licensePlate).value;
    VehicleYear.create(dto.year);
    await this.assertLicensePlateAvailable(licensePlate);
    return this.vehicles.save(
      Object.assign(new VehicleEntity(), dto, { licensePlate }),
    );
  }

  list(): Promise<VehicleEntity[]> {
    return this.vehicles.findAll();
  }

  async getById(id: string): Promise<VehicleEntity> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<VehicleEntity> {
    const vehicle = await this.getById(id);
    if (dto.licensePlate) {
      const licensePlate = LicensePlate.create(dto.licensePlate).value;
      if (licensePlate !== vehicle.licensePlate)
        await this.assertLicensePlateAvailable(licensePlate);
      dto.licensePlate = licensePlate;
    }
    if (dto.year !== undefined) VehicleYear.create(dto.year);
    return this.vehicles.save(Object.assign(vehicle, dto));
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.getById(id);
    try {
      await this.vehicles.remove(vehicle);
    } catch (error) {
      if (isForeignKeyViolation(error))
        throw new ConflictException('Vehicle is referenced by work orders');
      throw error;
    }
  }

  private async assertLicensePlateAvailable(
    licensePlate: string,
  ): Promise<void> {
    if (await this.vehicles.findByLicensePlate(licensePlate)) {
      throw new ConflictException('Vehicle license plate already exists');
    }
  }
}
