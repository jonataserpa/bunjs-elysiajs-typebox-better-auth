#!/usr/bin/env bun

// Script simples para testar todas as rotas e verificar se não há erros 404

const BASE_URL = 'http://localhost:3000';

const routes = [
  '/',
  '/health',
  '/health/',
  '/health/ready',
  '/health/live',
  '/docs',
  '/docs/json',
  '/favicon.ico'
];

console.log('🧪 Testando todas as rotas...\n');

for (const route of routes) {
  try {
    const response = await fetch(`${BASE_URL}${route}`);
    const status = response.status;
    const statusText = response.ok ? '✅ OK' : `❌ ${status}`;
    
    console.log(`${statusText} ${route} - ${status}`);
    
    if (response.ok && route !== '/favicon.ico') {
      const data = await response.json();
      console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`❌ ${route} - ERROR: ${error.message}`);
  }
  console.log('');
}

console.log('✅ Teste de rotas concluído!');
