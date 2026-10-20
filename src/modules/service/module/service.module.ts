import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../entity/service.entity';
import { ServiceRepository } from '../repository/service.repository';
import { ServiceService } from '../service/service.service';
import { ServiceController } from '../controller/service.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  controllers: [ServiceController],
  providers: [ServiceRepository, ServiceService],
  exports: [ServiceRepository],
})
export class ServiceModule {}
