import { DomainError } from '../domain-error';

export class WorkOrderCode {
  private constructor(readonly value: string) {}

  static create(value: string): WorkOrderCode {
    const normalized = value.trim().toUpperCase();
    if (!/^[A-Z0-9-]{6,30}$/.test(normalized))
      throw new DomainError('Work order code is invalid');
    return new WorkOrderCode(normalized);
  }

  static generate(): WorkOrderCode {
    return new WorkOrderCode(
      `OS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    );
  }

  toJSON(): string {
    return this.value;
  }
}
