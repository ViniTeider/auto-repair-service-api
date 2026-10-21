import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// JWT_EXPIRATION accepts a duration such as "1d" or "2h"; a plain number means seconds.
const expiration = (config: ConfigService): JwtSignOptions['expiresIn'] => {
  const value = config.get<string>('JWT_EXPIRATION') ?? '1d';
  return /^\d+$/.test(value)
    ? Number(value)
    : (value as JwtSignOptions['expiresIn']);
};

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret)
          throw new Error('Missing required environment variable JWT_SECRET');
        return { secret, signOptions: { expiresIn: expiration(config) } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
