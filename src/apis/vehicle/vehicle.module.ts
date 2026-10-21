import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleEntity } from '../../core/entities/vehicle.entity';
import { AuthModule } from '../auth/auth.module';
import { VehicleController } from './vehicle.controller';
import { VehicleRepository } from './vehicle.repository';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleEntity]), AuthModule],
  controllers: [VehicleController],
  providers: [VehicleRepository, VehicleService],
  exports: [VehicleRepository],
})
export class VehicleModule {}
