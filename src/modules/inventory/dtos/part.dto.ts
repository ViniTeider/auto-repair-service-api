import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CreatePartDto {
  @ApiProperty({ example: 'Oil filter' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 20, minimum: 0 })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ default: 0, example: 1, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumStock?: number;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}

export class ReplenishPartDto {
  @ApiProperty({ minimum: 1, example: 5 })
  @IsInt()
  @IsPositive()
  quantity!: number;
}
