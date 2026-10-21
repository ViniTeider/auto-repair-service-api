import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class RemoveItemQueryDto {
  @ApiProperty({
    minimum: 1,
    example: 1,
    description: 'Quantity to remove from the work order item',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity!: number;
}
