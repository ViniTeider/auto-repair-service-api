import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropAdminUser1710000000002 implements MigrationInterface {
  name = 'DropAdminUser1710000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS admin_user');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS admin_user (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL UNIQUE,
        "passwordHash" varchar(255) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
  }
}
