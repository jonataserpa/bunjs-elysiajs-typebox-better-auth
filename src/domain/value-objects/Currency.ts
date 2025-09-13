import { ValueObject } from './ValueObject';

/**
 * Value Object para representar moedas
 */
export class Currency extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('Currency deve ser uma string válida');
    }
    const validCurrencies = ['BRL', 'USD', 'EUR'];
    if (!validCurrencies.includes(this.value.toUpperCase())) {
      throw new Error(`Currency deve ser uma das seguintes: ${validCurrencies.join(', ')}`);
    }
  }

  // Método público para acessar o valor
  getValue(): string {
    return this.value;
  }

  // Verifica se é BRL
  isBRL(): boolean {
    return this.value.toUpperCase() === 'BRL';
  }

  // Verifica se é USD
  isUSD(): boolean {
    return this.value.toUpperCase() === 'USD';
  }

  // Verifica se é EUR
  isEUR(): boolean {
    return this.value.toUpperCase() === 'EUR';
  }

  // Retorna o símbolo da moeda
  getSymbol(): string {
    switch (this.value.toUpperCase()) {
      case 'BRL':
        return 'R$';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return this.value;
    }
  }

  // Retorna informações da moeda
  getCurrencyInfo(): { code: string; symbol: string; name: string } {
    switch (this.value.toUpperCase()) {
      case 'BRL':
        return { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' };
      case 'USD':
        return { code: 'USD', symbol: '$', name: 'Dólar Americano' };
      case 'EUR':
        return { code: 'EUR', symbol: '€', name: 'Euro' };
      default:
        return { code: this.value, symbol: this.value, name: this.value };
    }
  }
}
