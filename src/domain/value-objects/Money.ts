import { ValueObject } from './ValueObject';

/**
 * Value Object para representar valores monetários
 */
export class Money extends ValueObject<number> {
  constructor(value: number) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (typeof this.value !== 'number') {
      throw new Error('Money deve ser um número');
    }
    if (this.value < 0) {
      throw new Error('Money não pode ser negativo');
    }
    if (!Number.isInteger(this.value)) {
      throw new Error('Money deve ser um número inteiro (centavos)');
    }
  }

  // Método público para acessar o valor
  getValue(): number {
    return this.value;
  }

  // Converte centavos para reais
  toReais(): number {
    return this.value / 100;
  }

  // Cria Money a partir de reais
  static fromReais(reais: number): Money {
    return new Money(Math.round(reais * 100));
  }

  // Adiciona outro Money
  add(other: Money): Money {
    return new Money(this.value + other.getValue());
  }

  // Subtrai outro Money
  subtract(other: Money): Money {
    const result = this.value - other.getValue();
    if (result < 0) {
      throw new Error('Resultado não pode ser negativo');
    }
    return new Money(result);
  }

  // Multiplica por um número
  multiply(factor: number): Money {
    return new Money(Math.round(this.value * factor));
  }

  // Formata para exibição
  format(currency: string = 'BRL'): string {
    const reais = this.toReais();
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(reais);
  }

  // Compara com outro Money
  equals(other: Money): boolean {
    return this.value === other.getValue();
  }

  // Verifica se é maior que outro Money
  isGreaterThan(other: Money): boolean {
    return this.value > other.getValue();
  }

  // Verifica se é maior ou igual a outro Money
  isGreaterThanOrEqual(other: Money): boolean {
    return this.value >= other.getValue();
  }

  // Verifica se é menor que outro Money
  isLessThan(other: Money): boolean {
    return this.value < other.getValue();
  }

  // Verifica se é menor ou igual a outro Money
  isLessThanOrEqual(other: Money): boolean {
    return this.value <= other.getValue();
  }
}
