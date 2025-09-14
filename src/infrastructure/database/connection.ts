import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { dbConfig } from '../../shared/config/db.config';
import * as schema from './schema';

// Configuração do cliente PostgreSQL
const client = postgres(dbConfig.url, {
  max: dbConfig.pool.max,
  idle_timeout: dbConfig.pool.idleTimeoutMillis / 1000,
  connect_timeout: dbConfig.pool.connectionTimeoutMillis / 1000,
  ssl: dbConfig.ssl,
});

// Instância do Drizzle ORM
export const db = drizzle(client, { schema });

// Função para testar a conexão
export async function testConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error);
    return false;
  }
}

// Função para fechar a conexão
export async function closeConnection(): Promise<void> {
  try {
    await client.end();
    console.log('✅ Conexão com PostgreSQL fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão com PostgreSQL:', error);
  }
}

// Função para executar migrações
export async function runMigrations(): Promise<void> {
  try {
    // TODO: Implementar execução de migrações quando o sistema estiver configurado
    console.log('📦 Sistema de migrações preparado');
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    throw error;
  }
}

export default db;
