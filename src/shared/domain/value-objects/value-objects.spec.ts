import { DomainError } from '../domain-error';
import { Document } from './document';
import { LicensePlate } from './license-plate';
import { Money } from './money';
import { Quantity } from './quantity';
import { VehicleYear } from './vehicle-year';
import { WorkOrderCode } from './work-order-code';

describe('shared value objects', () => {
  it('accepts valid CPF and CNPJ documents', () => {
    expect(Document.create('529.982.247-25').type).toBe('CPF');
    expect(Document.create('04.252.011/0001-10').type).toBe('CNPJ');
  });

  it('rejects invalid documents', () => {
    expect(() => Document.create('111.111.111-11')).toThrow(DomainError);
  });

  it('accepts old and Mercosur plates', () => {
    expect(LicensePlate.create('ABC-1234').value).toBe('ABC1234');
    expect(LicensePlate.create('ABC1D23').value).toBe('ABC1D23');
    expect(() => LicensePlate.create('invalid')).toThrow(DomainError);
  });

  it('supports money arithmetic and positive quantities', () => {
    expect(Money.fromAmount(10.5).add(Money.fromAmount(2)).toAmount()).toBe(12.5);
    expect(Money.fromAmount(3).multiply(2).toAmount()).toBe(6);
    expect(Quantity.create(1).value).toBe(1);
    expect(() => Quantity.create(0)).toThrow(DomainError);
    expect(() => Money.fromAmount(-1)).toThrow(DomainError);
    expect(Money.fromCents(250).toAmount()).toBe(2.5);
  });

  it('creates and validates work-order codes and years', () => {
    const generatedCode = WorkOrderCode.generate();
    expect(generatedCode.value).toMatch(/^OS-/);
    expect(generatedCode.toJSON()).toBe(generatedCode.value);
    expect(WorkOrderCode.create('OS-ABC123').value).toBe('OS-ABC123');
    expect(() => WorkOrderCode.create('x')).toThrow(DomainError);
    expect(VehicleYear.create(new Date().getFullYear()).value).toBe(new Date().getFullYear());
    expect(() => VehicleYear.create(1800)).toThrow(DomainError);
  });
});
