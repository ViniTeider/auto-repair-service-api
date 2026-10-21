import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../../core/dtos/auth/login.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login')
  @ApiOperation({ summary: 'Authenticate an administrator' })
  @ApiResponse({ status: 201, description: 'JWT access token returned' })
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }
}
