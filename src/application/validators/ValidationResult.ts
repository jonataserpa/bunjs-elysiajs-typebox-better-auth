/**
 * Erro de validação
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Classe para resultado de validação
 */
export class ValidationResult {
  public readonly isValid: boolean;
  public readonly errors: ValidationError[];

  constructor(errors: ValidationError[] = []) {
    this.errors = [...errors];
    this.isValid = this.errors.length === 0;
  }

  /**
   * Cria um resultado válido
   */
  static valid(): ValidationResult {
    return new ValidationResult([]);
  }

  /**
   * Cria um resultado inválido com um erro
   */
  static invalid(field: string, message: string, code: string = 'VALIDATION_ERROR'): ValidationResult {
    return new ValidationResult([{ field, message, code }]);
  }

  /**
   * Cria um resultado inválido com múltiplos erros
   */
  static invalidWithErrors(errors: ValidationError[]): ValidationResult {
    return new ValidationResult(errors);
  }

  /**
   * Adiciona um erro ao resultado
   */
  addError(field: string, message: string, code: string = 'VALIDATION_ERROR'): ValidationResult {
    return new ValidationResult([...this.errors, { field, message, code }]);
  }

  /**
   * Adiciona múltiplos erros
   */
  addErrors(errors: ValidationError[]): ValidationResult {
    return new ValidationResult([...this.errors, ...errors]);
  }

  /**
   * Retorna os erros de um campo específico
   */
  getErrorsForField(field: string): ValidationError[] {
    return this.errors.filter(error => error.field === field);
  }

  /**
   * Retorna todos os erros
   */
  getAllErrors(): ValidationError[] {
    return [...this.errors];
  }
}

/**
 * Classe para construir resultados de validação
 */
export class ValidationResultBuilder {
  private errors: ValidationError[] = [];

  /**
   * Adiciona um erro de validação
   */
  addError(field: string, message: string, code: string = 'VALIDATION_ERROR'): this {
    this.errors.push({ field, message, code });
    return this;
  }

  /**
   * Adiciona múltiplos erros
   */
  addErrors(errors: ValidationError[]): this {
    this.errors.push(...errors);
    return this;
  }

  /**
   * Verifica se há erros
   */
  isValid(): boolean {
    return this.errors.length === 0;
  }

  /**
   * Constrói o resultado final
   */
  build(): ValidationResult {
    return new ValidationResult(this.errors);
  }

  /**
   * Retorna os erros de um campo específico
   */
  getErrorsForField(field: string): ValidationError[] {
    return this.errors.filter(error => error.field === field);
  }

  /**
   * Retorna todos os erros
   */
  getAllErrors(): ValidationError[] {
    return [...this.errors];
  }

  /**
   * Limpa todos os erros
   */
  clear(): this {
    this.errors = [];
    return this;
  }
}
