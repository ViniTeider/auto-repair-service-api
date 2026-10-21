// Test-only values; real values come from the .env file.
process.env.JWT_SECRET ??= 'test-jwt-secret';
process.env.ADMIN_DEFAULT_EMAIL ??= 'admin@test.local';
process.env.ADMIN_DEFAULT_PASSWORD ??= 'test-admin-password';
process.env.JWT_EXPIRATION = '3600';
