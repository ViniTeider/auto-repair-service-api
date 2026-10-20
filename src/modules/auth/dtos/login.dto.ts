import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@repair-shop.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'AdminSecurePassword123!' })
  @IsString()
  @MinLength(8)
  password!: string;
}
