import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartEntity } from '../../core/entities/part.entity';
import { AuthModule } from '../auth/auth.module';
import { PartRepository } from './part.repository';
import { PartService } from './services/part.service';
import { PartApplicationService } from './services/part-application.service';
import { PartController } from './part.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PartEntity]), AuthModule],
  controllers: [PartController],
  providers: [PartRepository, PartService, PartApplicationService],
  exports: [PartRepository, PartApplicationService],
})
export class PartModule {}
