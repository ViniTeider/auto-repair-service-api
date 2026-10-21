import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartEntity } from '../../core/entities/part.entity';
import { PartRepository } from './part.repository';
import { PartService } from './services/part.service';
import { InventoryApplicationService } from './services/inventory-application.service';
import { PartController } from './part.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PartEntity])],
  controllers: [PartController],
  providers: [PartRepository, PartService, InventoryApplicationService],
  exports: [PartRepository, InventoryApplicationService],
})
export class InventoryModule {}
