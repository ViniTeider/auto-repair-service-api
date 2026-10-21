import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC-1234' })
  @IsString()
  @MinLength(7)
  licensePlate!: string;

  @ApiProperty({ example: 'Ford' })
  @IsString()
  @MinLength(2)
  make!: string;

  @ApiProperty({ example: 'Ka' })
  @IsString()
  @MinLength(1)
  model!: string;

  @ApiProperty({ example: 2020 })
  @IsInt()
  year!: number;
}
