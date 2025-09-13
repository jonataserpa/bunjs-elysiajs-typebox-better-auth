import { ValueObject } from './ValueObject';

/**
 * Value Object para descrição de pagamento
 */
export class PaymentDescription extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('PaymentDescription deve ser uma string válida');
    }
    if (this.value.trim().length < 3) {
      throw new Error('PaymentDescription deve ter pelo menos 3 caracteres');
    }
    if (this.value.length > 255) {
      throw new Error('PaymentDescription não pode ter mais de 255 caracteres');
    }
  }

  // Método público para acessar o valor
  getValue(): string {
    return this.value;
  }

  // Retorna a descrição truncada
  getTruncated(maxLength: number = 50): string {
    if (this.value.length <= maxLength) {
      return this.value;
    }
    return this.value.substring(0, maxLength) + '...';
  }

  // Verifica se contém uma palavra específica
  contains(word: string): boolean {
    return this.value.toLowerCase().includes(word.toLowerCase());
  }

  // Retorna palavras-chave da descrição
  getKeywords(): string[] {
    return this.value
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }
}
