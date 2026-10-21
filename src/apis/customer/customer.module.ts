import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from '../../core/entities/customer.entity';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './services/customer.service';
import { CustomerApplicationService } from './services/customer-application.service';
import { CustomerController } from './customer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  controllers: [CustomerController],
  providers: [CustomerRepository, CustomerService, CustomerApplicationService],
  exports: [CustomerRepository, CustomerApplicationService],
})
export class CustomerModule {}
