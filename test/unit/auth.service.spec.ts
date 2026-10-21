import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/apis/auth/auth.service';

describe('AuthService', () => {
  const config = new ConfigService({
    ADMIN_EMAIL: 'admin@test.local',
    ADMIN_PASSWORD: 'test-admin-password',
  });
  const jwt = new JwtService({ secret: 'test-secret' });

  it('authenticates the configured admin and rejects invalid credentials', async () => {
    const auth = new AuthService(jwt, config);
    await expect(
      auth.login('admin@test.local', 'test-admin-password'),
    ).resolves.toHaveProperty('accessToken');
    await expect(auth.login('admin@test.local', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('refuses to start without the admin credentials', () => {
    expect(
      () =>
        new AuthService(jwt, {
          get: () => undefined,
        } as unknown as ConfigService),
    ).toThrow('ADMIN_EMAIL');
  });
});
