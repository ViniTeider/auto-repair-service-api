import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE IF NOT EXISTS admin_user (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL UNIQUE,
        "passwordHash" varchar(255) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS customer (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        document varchar(14) NOT NULL UNIQUE,
        name varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        phone varchar(40) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS vehicle (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "licensePlate" varchar(7) NOT NULL UNIQUE,
        make varchar(120) NOT NULL,
        model varchar(120) NOT NULL,
        year smallint NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS service (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        description varchar(255),
        "priceInCents" integer NOT NULL CHECK ("priceInCents" >= 0),
        active boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS part (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL UNIQUE,
        "priceInCents" integer NOT NULL CHECK ("priceInCents" >= 0),
        "stockQuantity" integer NOT NULL DEFAULT 0 CHECK ("stockQuantity" >= 0),
        "minimumStock" integer NOT NULL DEFAULT 0 CHECK ("minimumStock" >= 0),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS work_order (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(30) NOT NULL UNIQUE,
        "customerId" uuid NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
        "vehicleId" uuid NOT NULL REFERENCES vehicle(id) ON DELETE RESTRICT,
        status varchar(30) NOT NULL,
        "budgetStatus" varchar(20) NOT NULL,
        "totalInCents" integer NOT NULL DEFAULT 0 CHECK ("totalInCents" >= 0),
        "executionStartedAt" timestamptz,
        "executionFinishedAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS work_order_item (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "workOrderId" uuid NOT NULL REFERENCES work_order(id) ON DELETE CASCADE,
        kind varchar(10) NOT NULL,
        "referenceId" uuid NOT NULL,
        description varchar(255) NOT NULL,
        "unitPriceInCents" integer NOT NULL CHECK ("unitPriceInCents" >= 0),
        quantity integer NOT NULL CHECK (quantity > 0)
      );
      CREATE TABLE IF NOT EXISTS stock_movement (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "partId" uuid NOT NULL REFERENCES part(id),
        quantity integer NOT NULL CHECK (quantity > 0),
        type varchar(20) NOT NULL,
        reason varchar(255),
        "workOrderId" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE IF EXISTS stock_movement, work_order_item, work_order, part, service, vehicle, customer, admin_user',
    );
  }
}
