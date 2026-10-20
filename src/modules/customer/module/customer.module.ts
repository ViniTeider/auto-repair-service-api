import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer, Vehicle } from '../entity';
import { CustomerRepository } from '../repository/customer.repository';
import { VehicleRepository } from '../repository/vehicle.repository';
import { CustomerService } from '../service/customer.service';
import { CustomerController } from '../controller/customer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Vehicle])],
  controllers: [CustomerController],
  providers: [CustomerRepository, VehicleRepository, CustomerService],
  exports: [CustomerRepository, VehicleRepository],
})
export class CustomerModule {}
