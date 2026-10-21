import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/apis/auth/auth.service';

describe('AuthService', () => {
  const auth = new AuthService(new JwtService({ secret: 'test-secret' }));

  it('authenticates the configured admin and rejects invalid credentials', async () => {
    await expect(
      auth.login('admin@repair-shop.com', 'AdminSecurePassword123!'),
    ).resolves.toHaveProperty('accessToken');
    await expect(auth.login('admin@repair-shop.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
  });
});
