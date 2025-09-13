/**
 * Classe base para todos os Domain Events
 * Domain Events representam algo importante que aconteceu no domínio
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(eventId?: string) {
    this.occurredOn = new Date();
    this.eventId = eventId || this.generateEventId();
  }

  /**
   * Gera um ID único para o evento
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Nome do evento para identificação
   */
  abstract get eventName(): string;

  /**
   * Versão do evento para compatibilidade
   */
  abstract get eventVersion(): number;

  /**
   * Dados do evento para serialização
   */
  abstract get eventData(): Record<string, any>;

  /**
   * Converte o evento para JSON
   */
  toJSON(): string {
    return JSON.stringify({
      eventId: this.eventId,
      eventName: this.eventName,
      eventVersion: this.eventVersion,
      occurredOn: this.occurredOn.toISOString(),
      data: this.eventData
    });
  }

  /**
   * Cria um evento a partir de JSON
   */
  static fromJSON<T extends DomainEvent>(
    json: string,
    eventClass: new (data: any) => T
  ): T {
    const parsed = JSON.parse(json);
    return new eventClass(parsed.data);
  }
}
