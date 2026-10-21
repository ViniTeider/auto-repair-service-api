import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRoleEnum } from '../../core/enums/user-role.enum';

@Injectable()
export class AuthService {
  private readonly adminEmail: string;
  private readonly adminHash: string;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.adminEmail = this.required(config, 'ADMIN_DEFAULT_EMAIL');
    this.adminHash = bcrypt.hashSync(
      this.required(config, 'ADMIN_DEFAULT_PASSWORD'),
      10,
    );
  }

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

  private required(config: ConfigService, key: string): string {
    const value = config.get<string>(key);
    if (!value) throw new Error(`Missing required environment variable ${key}`);
    return value;
  }
}
