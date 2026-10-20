import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Part } from '../entity/part.entity';
import { PartRepository } from '../repository/part.repository';
import { PartService } from '../service/part.service';
import { PartController } from '../controller/part.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Part])],
  controllers: [PartController],
  providers: [PartRepository, PartService],
  exports: [PartRepository],
})
export class InventoryModule {}
