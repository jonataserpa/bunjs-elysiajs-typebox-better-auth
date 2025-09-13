#!/usr/bin/env bun

// Script para testar a conexão com o banco de dados

import { testConnection, closeConnection } from './src/infrastructure/database/connection.js';

console.log('🧪 Testando conexão com o banco de dados...\n');

try {
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
    console.log('📊 Pronto para executar migrações e operações no banco');
  } else {
    console.log('❌ Falha ao conectar com o banco de dados');
    console.log('🔧 Verifique se o PostgreSQL está rodando e as credenciais estão corretas');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erro ao testar conexão:', error.message);
  process.exit(1);
} finally {
  await closeConnection();
  console.log('✅ Teste de conexão concluído');
}
