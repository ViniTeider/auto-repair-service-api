import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from '../../core/entities/customer.entity';
import { AuthModule } from '../auth/auth.module';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './customer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity]), AuthModule],
  controllers: [CustomerController],
  providers: [CustomerRepository, CustomerService],
  exports: [CustomerRepository],
})
export class CustomerModule {}
