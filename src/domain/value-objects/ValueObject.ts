/**
 * Classe base para Value Objects
 * Value Objects são objetos que são definidos pelo seu valor, não por identidade
 * Eles são imutáveis e devem ser comparados por valor, não por referência
 */
export abstract class ValueObject<T> {
  protected readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  /**
   * Compara dois Value Objects por valor
   */
  equals(other: ValueObject<T>): boolean {
    if (this.constructor !== other.constructor) {
      return false;
    }
    return this.deepEqual(this.value, other.value);
  }

  /**
   * Retorna o valor primitivo
   */
  getValue(): T {
    return this.value;
  }

  /**
   * Converte para string
   */
  toString(): string {
    return String(this.value);
  }

  /**
   * Comparação profunda de valores
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!this.deepEqual(a[i], b[i])) return false;
        }
        return true;
      }

      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!this.deepEqual(a[key], b[key])) return false;
      }
      
      return true;
    }

    return false;
  }
}
