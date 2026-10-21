import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from '../../core/entities/customer.entity';
import { VehicleEntity } from '../../core/entities/vehicle.entity';
import { CustomerRepository } from './repositories/customer.repository';
import { VehicleRepository } from './repositories/vehicle.repository';
import { CustomerService } from './services/customer.service';
import { CustomerApplicationService } from './services/customer-application.service';
import { CustomerController } from './customer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity, VehicleEntity])],
  controllers: [CustomerController],
  providers: [
    CustomerRepository,
    VehicleRepository,
    CustomerService,
    CustomerApplicationService,
  ],
  exports: [CustomerRepository, VehicleRepository, CustomerApplicationService],
})
export class CustomerModule {}
