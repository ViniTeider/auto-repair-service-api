import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { StockMovementTypeEnum } from '../enums/stock-movement-type.enum';

export class CreateStockMovementDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  partId!: string;

  @ApiProperty({
    enum: StockMovementTypeEnum,
    description:
      'ENTRY adds to the balance, EXIT removes from it and ADJUSTMENT sets the balance, ignoring the previous one',
  })
  @IsEnum(StockMovementTypeEnum)
  type!: StockMovementTypeEnum;

  @ApiProperty({
    minimum: 0,
    example: 5,
    description:
      'Amount to add or remove (greater than zero), or the new balance for an ADJUSTMENT',
  })
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional({ example: 'Supplier delivery' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
