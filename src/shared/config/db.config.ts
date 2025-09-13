import { appConfig } from './app.config';

export const dbConfig = {
  host: appConfig.database.host,
  port: appConfig.database.port,
  database: appConfig.database.name,
  username: appConfig.database.username,
  password: appConfig.database.password,
  url: appConfig.database.url,
  
  // Configurações de pool
  pool: {
    min: 2,
    max: appConfig.database.maxConnections,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: appConfig.database.connectionTimeout,
  },
  
  // Configurações SSL
  ssl: appConfig.database.ssl ? { rejectUnauthorized: false } : false,
  
  // Configurações de migração
  migrations: {
    directory: './src/infrastructure/database/migrations',
    tableName: 'drizzle_migrations',
  },
} as const;

export type DbConfig = typeof dbConfig;
