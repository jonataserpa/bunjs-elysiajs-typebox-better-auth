import { DomainEvent } from '../../domain/events/DomainEvent';

/**
 * Interface para handlers de eventos de domínio
 */
export interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

/**
 * Classe base para handlers de eventos
 */
export abstract class BaseDomainEventHandler<T extends DomainEvent> implements DomainEventHandler<T> {
  abstract handle(event: T): Promise<void>;

  /**
   * Verifica se o handler pode processar o evento
   */
  abstract canHandle(event: DomainEvent): boolean;

  /**
   * Nome do evento que este handler processa
   */
  abstract get eventName(): string;
}

/**
 * Registry para handlers de eventos
 */
export class DomainEventRegistry {
  private handlers: Map<string, DomainEventHandler<any>[]> = new Map();

  /**
   * Registra um handler para um tipo de evento
   */
  register<T extends DomainEvent>(eventName: string, handler: DomainEventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  /**
   * Obtém handlers para um tipo de evento
   */
  getHandlers<T extends DomainEvent>(eventName: string): DomainEventHandler<T>[] {
    return this.handlers.get(eventName) || [];
  }

  /**
   * Obtém todos os handlers registrados
   */
  getAllHandlers(): Map<string, DomainEventHandler<any>[]> {
    return new Map(this.handlers);
  }

  /**
   * Remove um handler específico
   */
  unregister(eventName: string, handler: DomainEventHandler<any>): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Remove todos os handlers de um tipo de evento
   */
  unregisterAll(eventName: string): void {
    this.handlers.delete(eventName);
  }

  /**
   * Limpa todos os handlers
   */
  clear(): void {
    this.handlers.clear();
  }
}

/**
 * Dispatcher de eventos de domínio
 */
export class DomainEventDispatcher {
  constructor(private readonly registry: DomainEventRegistry) {}

  /**
   * Dispara um evento para todos os handlers registrados
   */
  async dispatch<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.registry.getHandlers<T>(event.eventName);
    
    const promises = handlers.map(async (handler) => {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`Erro ao processar evento ${event.eventName}:`, error);
        // Não re-lançar o erro para não interromper outros handlers
      }
    });

    await Promise.all(promises);
  }

  /**
   * Dispara múltiplos eventos
   */
  async dispatchMultiple<T extends DomainEvent>(events: T[]): Promise<void> {
    const promises = events.map(event => this.dispatch(event));
    await Promise.all(promises);
  }
}

/**
 * Singleton para o dispatcher global
 */
export class DomainEventService {
  private static instance: DomainEventDispatcher;
  private static registry: DomainEventRegistry;

  /**
   * Obtém a instância singleton do dispatcher
   */
  static getInstance(): DomainEventDispatcher {
    if (!DomainEventService.instance) {
      DomainEventService.registry = new DomainEventRegistry();
      DomainEventService.instance = new DomainEventDispatcher(DomainEventService.registry);
    }
    return DomainEventService.instance;
  }

  /**
   * Obtém o registry para registro de handlers
   */
  static getRegistry(): DomainEventRegistry {
    if (!DomainEventService.registry) {
      DomainEventService.registry = new DomainEventRegistry();
      DomainEventService.instance = new DomainEventDispatcher(DomainEventService.registry);
    }
    return DomainEventService.registry;
  }

  /**
   * Registra um handler
   */
  static registerHandler<T extends DomainEvent>(eventName: string, handler: DomainEventHandler<T>): void {
    DomainEventService.getRegistry().register(eventName, handler);
  }

  /**
   * Dispara um evento
   */
  static async dispatchEvent<T extends DomainEvent>(event: T): Promise<void> {
    await DomainEventService.getInstance().dispatch(event);
  }

  /**
   * Dispara múltiplos eventos
   */
  static async dispatchEvents<T extends DomainEvent>(events: T[]): Promise<void> {
    await DomainEventService.getInstance().dispatchMultiple(events);
  }
}
