import { DomainError } from '../domain-error';

export class Quantity {
  private constructor(readonly value: number) {}

  static create(value: number): Quantity {
    if (!Number.isInteger(value) || value <= 0) throw new DomainError('Quantity must be greater than zero');
    return new Quantity(value);
  }
}
