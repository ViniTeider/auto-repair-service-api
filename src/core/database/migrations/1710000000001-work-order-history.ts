import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorkOrderHistory1710000000001 implements MigrationInterface {
  name = 'WorkOrderHistory1710000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS work_order_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "workOrderId" uuid NOT NULL REFERENCES work_order(id) ON DELETE CASCADE,
        status varchar(30) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "IDX_work_order_history_workOrderId" ON work_order_history ("workOrderId");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS work_order_history');
  }
}
