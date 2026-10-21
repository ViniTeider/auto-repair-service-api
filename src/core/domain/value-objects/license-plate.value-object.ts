import { DomainError } from '../domain-error';

export class LicensePlate {
  private constructor(readonly value: string) {}

  static create(input: string): LicensePlate {
    const value = input.trim().toUpperCase();
    const valid =
      /^[A-Z]{3}-?\d{4}$/.test(value) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(value);
    if (!valid)
      throw new DomainError('License plate must use an old or Mercosur format');
    return new LicensePlate(value.replace('-', ''));
  }

  equals(other: LicensePlate): boolean {
    return this.value === other.value;
  }
}
