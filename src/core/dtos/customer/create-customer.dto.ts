import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: '529.982.247-25' })
  @IsString()
  @MinLength(3)
  document!: string;

  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '11999999999' })
  @IsString()
  @MinLength(8)
  phone!: string;
}
