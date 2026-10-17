import { DomainError } from '../domain-error';

export class Document {
  private constructor(
    readonly value: string,
    readonly type: 'CPF' | 'CNPJ',
  ) {}

  static create(input: string): Document {
    const normalized = input.replace(/\D/g, '');
    if (normalized.length === 11 && Document.isValidCpf(normalized)) {
      return new Document(normalized, 'CPF');
    }
    if (normalized.length === 14 && Document.isValidCnpj(normalized)) {
      return new Document(normalized, 'CNPJ');
    }
    throw new DomainError('Document must be a valid CPF or CNPJ');
  }

  equals(other: Document): boolean {
    return this.value === other.value;
  }

  private static isValidCpf(value: string): boolean {
    if (/^(\d)\1+$/.test(value)) return false;
    const digits = value.split('').map(Number);
    const first = Document.checkDigit(digits.slice(0, 9), 10);
    const second = Document.checkDigit(digits.slice(0, 10), 11);
    return first === digits[9] && second === digits[10];
  }

  private static isValidCnpj(value: string): boolean {
    if (/^(\d)\1+$/.test(value)) return false;
    const digits = value.split('').map(Number);
    const first = Document.checkCnpjDigit(digits.slice(0, 12));
    const second = Document.checkCnpjDigit(digits.slice(0, 13));
    return first === digits[12] && second === digits[13];
  }

  private static checkDigit(digits: number[], factor: number): number {
    // Multiplies each CPF digit by descending weights, then derives the check digit from the remainder.
    const sum = digits.reduce((total, digit) => total + digit * factor--, 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  }

  private static checkCnpjDigit(digits: number[]): number {
    // Applies the cyclic CNPJ weights from right to left and converts the modulo-11 result into a digit.
    let factor = digits.length === 12 ? 5 : 6;
    const sum = digits.reduce((total, digit) => {
      const result = total + digit * factor;
      factor = factor === 2 ? 9 : factor - 1;
      return result;
    }, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }
}
