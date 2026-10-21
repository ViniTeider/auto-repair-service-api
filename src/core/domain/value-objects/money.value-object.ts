import { DomainError } from '../domain-error';

export class Money {
  private constructor(readonly cents: number) {}

  static fromAmount(amount: number): Money {
    if (!Number.isFinite(amount) || amount < 0)
      throw new DomainError('Amount must be non-negative');
    return new Money(Math.round(amount * 100));
  }

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents) || cents < 0)
      throw new DomainError('Cents must be a non-negative integer');
    return new Money(cents);
  }

  toAmount(): number {
    return this.cents / 100;
  }

  add(other: Money): Money {
    return Money.fromCents(this.cents + other.cents);
  }

  multiply(quantity: number): Money {
    if (!Number.isInteger(quantity) || quantity < 0)
      throw new DomainError('Quantity must be a non-negative integer');
    return Money.fromCents(this.cents * quantity);
  }
}
