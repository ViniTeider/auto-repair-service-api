import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsPositive, IsString } from 'class-validator';
import { CatalogItemKindEnum } from '../../enums/catalog-item-kind.enum';

export class AddItemDto {
  @ApiProperty({ enum: CatalogItemKindEnum })
  @IsEnum(CatalogItemKindEnum)
  kind!: CatalogItemKindEnum;

  @ApiProperty({ format: 'uuid' })
  @IsString()
  referenceId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @IsPositive()
  quantity!: number;
}
