import { DomainError } from '../domain-error';

export class VehicleYear {
  private constructor(readonly value: number) {}

  static create(value: number): VehicleYear {
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(value) || value < 1886 || value > currentYear + 1) {
      throw new DomainError('Vehicle year is invalid');
    }
    return new VehicleYear(value);
  }
}
