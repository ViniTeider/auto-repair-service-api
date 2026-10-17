import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ApiService } from './api.service';
import { AdminController, AuthController, PublicController } from './api.controller';
import { JwtGuard } from '../identity/jwt.guard';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'development-secret', signOptions: { expiresIn: 86400 } })],
  controllers: [AuthController, AdminController, PublicController],
  providers: [ApiService, JwtGuard],
})
export class ApiModule {}
