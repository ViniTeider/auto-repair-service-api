import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class ReplenishPartDto {
  @ApiProperty({ minimum: 1, example: 5 })
  @IsInt()
  @IsPositive()
  quantity!: number;
}
