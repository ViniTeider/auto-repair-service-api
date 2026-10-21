import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponses } from '../../core/decorators/api-responses.decorator';
import { LoginDto } from '../../core/dtos/login.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login')
  @ApiOperation({ summary: 'Authenticate an administrator' })
  @ApiResponses({
    success: {
      status: HttpStatus.CREATED,
      description: 'JWT access token returned',
    },
    badRequest: true,
    unauthorized: 'Invalid credentials',
  })
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }
}
