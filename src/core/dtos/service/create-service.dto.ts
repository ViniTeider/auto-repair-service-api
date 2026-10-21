import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Oil change' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'Engine oil replacement' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 100, minimum: 0 })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
