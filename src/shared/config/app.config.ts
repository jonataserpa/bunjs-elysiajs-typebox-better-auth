import { LogLevel } from '../../infrastructure/logging/Logger';

/**
 * Configurações da aplicação
 */
export interface AppConfig {
  // Servidor
  port: number;
  host: string;
  environment: 'development' | 'staging' | 'production';
  
  // Banco de dados
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
    maxConnections: number;
    connectionTimeout: number;
  };
  
  // Redis
  redis: {
    url: string;
    host: string;
    port: number;
    password?: string;
    db: number;
    maxRetriesPerRequest: number;
    retryDelayOnFailover: number;
  };
  
  // Autenticação
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenExpiresIn: string;
    bcryptRounds: number;
  };
  
  // Logging
  logging: {
    level: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    logFile?: string;
  };
  
  // CORS
  cors: {
    origin: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
  
  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  
  // Webhooks
  webhooks: {
    timeout: number;
    maxRetries: number;
    retryDelay: number;
  };
  
  // External Services
  externalServices: {
    timeout: number;
    maxRetries: number;
    retryDelay: number;
  };
}

/**
 * Carrega configurações das variáveis de ambiente
 */
export function loadConfig(): AppConfig {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  // Verifica variáveis obrigatórias
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Variável de ambiente obrigatória não encontrada: ${envVar}`);
    }
  }

  return {
    // Servidor
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
    
    // Banco de dados
    database: {
      url: process.env.DATABASE_URL!,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'payment_db',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true',
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
    },
    
    // Redis
    redis: {
      url: process.env.REDIS_URL!,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
      retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),
    },
    
    // Autenticação
    auth: {
      jwtSecret: process.env.JWT_SECRET!,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    },
    
    // Logging
    logging: {
      level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
      enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
      enableFile: process.env.LOG_ENABLE_FILE === 'true',
      logFile: process.env.LOG_FILE,
    },
    
    // CORS
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://0.0.0.0:3000', 'http://127.0.0.1:3000'],
      credentials: process.env.CORS_CREDENTIALS === 'true',
      methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(',') || ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    },
    
    // Rate Limiting
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL === 'true',
    },
    
    // Webhooks
    webhooks: {
      timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '30000', 10),
      maxRetries: parseInt(process.env.WEBHOOK_MAX_RETRIES || '3', 10),
      retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY || '1000', 10),
    },
    
    // External Services
    externalServices: {
      timeout: parseInt(process.env.EXTERNAL_SERVICE_TIMEOUT || '30000', 10),
      maxRetries: parseInt(process.env.EXTERNAL_SERVICE_MAX_RETRIES || '3', 10),
      retryDelay: parseInt(process.env.EXTERNAL_SERVICE_RETRY_DELAY || '1000', 10),
    },
  };
}

/**
 * Configuração global da aplicação
 */
export const appConfig = loadConfig();

/**
 * Valida configurações em tempo de execução
 */
export function validateConfig(config: AppConfig): void {
  // Validações básicas
  if (config.port < 1 || config.port > 65535) {
    throw new Error('Porta deve estar entre 1 e 65535');
  }

  if (!['development', 'staging', 'production'].includes(config.environment)) {
    throw new Error('Ambiente deve ser development, staging ou production');
  }

  if (config.database.maxConnections < 1) {
    throw new Error('Número máximo de conexões deve ser maior que 0');
  }

  if (config.auth.bcryptRounds < 4 || config.auth.bcryptRounds > 31) {
    throw new Error('BCrypt rounds deve estar entre 4 e 31');
  }
}

/**
 * Verifica se está em ambiente de desenvolvimento
 */
export function isDevelopment(): boolean {
  return appConfig.environment === 'development';
}

/**
 * Verifica se está em ambiente de produção
 */
export function isProduction(): boolean {
  return appConfig.environment === 'production';
}

/**
 * Verifica se está em ambiente de staging
 */
export function isStaging(): boolean {
  return appConfig.environment === 'staging';
}