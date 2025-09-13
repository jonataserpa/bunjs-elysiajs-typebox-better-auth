/**
 * Sistema de logging da aplicação
 * Implementa diferentes níveis de log e formatos
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  error?: Error;
}

export interface LoggerInterface {
  debug(message: string, context?: string, metadata?: Record<string, any>): void;
  info(message: string, context?: string, metadata?: Record<string, any>): void;
  warn(message: string, context?: string, metadata?: Record<string, any>): void;
  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void;
}

/**
 * Implementação base do logger
 */
export class Logger implements LoggerInterface {
  private context: string;
  private minLevel: LogLevel;

  constructor(context: string = 'Application', minLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.minLevel = minLevel;
  }

  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    const logMetadata = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };

    this.log(LogLevel.ERROR, message, context, logMetadata);
  }

  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: context || this.context,
      metadata,
    };

    this.writeLog(logEntry);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.minLevel);
    const logLevelIndex = levels.indexOf(level);
    
    return logLevelIndex >= currentLevelIndex;
  }

  private writeLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const context = `[${entry.context}]`;
    const message = entry.message;
    
    let logLine = `${timestamp} ${level} ${context} ${message}`;
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      logLine += ` ${JSON.stringify(entry.metadata)}`;
    }

    // Console output
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logLine);
        break;
      case LogLevel.INFO:
        console.info(logLine);
        break;
      case LogLevel.WARN:
        console.warn(logLine);
        break;
      case LogLevel.ERROR:
        console.error(logLine);
        break;
    }

    // TODO: Implementar escritores adicionais (arquivo, banco de dados, etc.)
  }
}

/**
 * Factory para criar loggers específicos
 */
export class LoggerFactory {
  private static loggers: Map<string, Logger> = new Map();

  static create(context: string, minLevel?: LogLevel): Logger {
    const key = `${context}-${minLevel || LogLevel.INFO}`;
    
    if (!this.loggers.has(key)) {
      this.loggers.set(key, new Logger(context, minLevel));
    }
    
    return this.loggers.get(key)!;
  }

  static getApplicationLogger(): Logger {
    return this.create('Application');
  }

  static getPaymentLogger(): Logger {
    return this.create('Payment');
  }

  static getDatabaseLogger(): Logger {
    return this.create('Database');
  }

  static getExternalServiceLogger(): Logger {
    return this.create('ExternalService');
  }

  static getWebhookLogger(): Logger {
    return this.create('Webhook');
  }
}

/**
 * Logger global da aplicação
 */
export const logger = LoggerFactory.getApplicationLogger();
