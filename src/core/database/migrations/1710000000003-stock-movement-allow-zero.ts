import { MigrationInterface, QueryRunner } from 'typeorm';

// An ADJUSTMENT movement stores the new balance, which may be zero.
export class StockMovementAllowZero1710000000003 implements MigrationInterface {
  name = 'StockMovementAllowZero1710000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE stock_movement DROP CONSTRAINT IF EXISTS stock_movement_quantity_check;
      ALTER TABLE stock_movement ADD CONSTRAINT stock_movement_quantity_check CHECK (quantity >= 0);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE stock_movement DROP CONSTRAINT IF EXISTS stock_movement_quantity_check;
      ALTER TABLE stock_movement ADD CONSTRAINT stock_movement_quantity_check CHECK (quantity > 0);
    `);
  }
}
