import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRoleEnum } from '../../core/enums/user-role.enum';

@Injectable()
export class AuthService {
  private readonly adminEmail =
    process.env.ADMIN_DEFAULT_EMAIL ?? 'admin@repair-shop.com';
  private readonly adminPassword =
    process.env.ADMIN_DEFAULT_PASSWORD ?? 'AdminSecurePassword123!';
  private readonly adminHash = bcrypt.hashSync(this.adminPassword, 10);

  constructor(private readonly jwt: JwtService) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    if (
      email !== this.adminEmail ||
      !(await bcrypt.compare(password, this.adminHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      accessToken: await this.jwt.signAsync({
        sub: email,
        role: UserRoleEnum.ADMIN,
      }),
    };
  }
}
