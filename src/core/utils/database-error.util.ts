import { QueryFailedError } from 'typeorm';

const FOREIGN_KEY_VIOLATION = '23503';

export function isForeignKeyViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string } | undefined)?.code ===
      FOREIGN_KEY_VIOLATION
  );
}
