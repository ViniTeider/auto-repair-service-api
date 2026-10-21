import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendBudgetDto {
  @ApiProperty({
    example: '52998224725',
    description: 'Document of the work order customer',
  })
  @IsString()
  @MinLength(3)
  customerDocument!: string;
}
