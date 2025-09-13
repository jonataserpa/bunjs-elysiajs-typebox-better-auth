-- Script de inicialização do banco de dados
-- Este arquivo é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar usuário para a aplicação (opcional)
-- CREATE USER payment_api_user WITH PASSWORD 'payment_api_password';
-- GRANT ALL PRIVILEGES ON DATABASE payment_api TO payment_api_user;

-- O schema será criado automaticamente pelo Drizzle ORM através das migrações
