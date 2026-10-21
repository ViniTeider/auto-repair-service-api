import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleEntity } from '../../core/entities/vehicle.entity';
import { VehicleRepository } from './vehicle.repository';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleEntity])],
  providers: [VehicleRepository],
  exports: [VehicleRepository],
})
export class VehicleModule {}
