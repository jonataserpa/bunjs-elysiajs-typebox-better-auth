import { ValueObject } from './ValueObject';

/**
 * Value Object para ID de pagamento
 */
export class PaymentId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('PaymentId deve ser uma string válida');
    }
    if (this.value.length < 3) {
      throw new Error('PaymentId deve ter pelo menos 3 caracteres');
    }
  }

  // Método público para acessar o valor
  getValue(): string {
    return this.value;
  }
}
