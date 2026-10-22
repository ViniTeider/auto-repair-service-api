import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from '../../core/entities/service.entity';
import { AuthModule } from '../auth/auth.module';
import { ServiceRepository } from './service.repository';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity]), AuthModule],
  controllers: [ServiceController],
  providers: [ServiceRepository, ServiceService],
  exports: [ServiceRepository],
})
export class ServiceModule {}
