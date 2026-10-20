import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsPositive, IsString } from 'class-validator';
import { CatalogItemKind } from '../../../shared/enums/catalog.enums';

export class AddItemDto {
  @ApiProperty({ enum: CatalogItemKind })
  @IsEnum(CatalogItemKind)
  kind!: CatalogItemKind;

  @ApiProperty({ format: 'uuid' })
  @IsString()
  referenceId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class OpenWorkOrderDto {
  @ApiProperty({ example: '52998224725' })
  @IsString()
  customerDocument!: string;

  @ApiProperty({ example: 'ABC1234' })
  @IsString()
  vehiclePlate!: string;
}
