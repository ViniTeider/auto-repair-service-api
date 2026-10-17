import { IsBoolean, IsEmail, IsEnum, IsInt, IsOptional, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class CreateCustomerDto {
  @IsString()
  @MinLength(3)
  document!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  phone!: string;
}

export class CreateVehicleDto {
  @IsString()
  @MinLength(7)
  licensePlate!: string;

  @IsString()
  @MinLength(2)
  make!: string;

  @IsString()
  @MinLength(1)
  model!: string;

  @IsInt()
  year!: number;
}

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreatePartDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  minimumStock!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}

export class AddItemDto {
  @IsEnum(['SERVICE', 'PART'])
  kind!: 'SERVICE' | 'PART';

  @IsString()
  referenceId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
