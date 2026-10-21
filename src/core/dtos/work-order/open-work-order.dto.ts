import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class OpenWorkOrderDto {
  @ApiProperty({ example: '52998224725' })
  @IsString()
  customerDocument!: string;

  @ApiProperty({ example: 'ABC1234' })
  @IsString()
  vehiclePlate!: string;
}
