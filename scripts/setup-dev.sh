#!/bin/bash

# Script para setup do ambiente de desenvolvimento
# Este script configura o banco de dados e executa as migrações

echo "🚀 Configurando ambiente de desenvolvimento..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Remover volumes antigos (opcional - descomente se quiser limpar dados)
# echo "🗑️ Removendo volumes antigos..."
# docker-compose down -v

# Iniciar containers
echo "🐳 Iniciando containers..."
docker-compose up -d

# Aguardar o PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL estar pronto..."
until docker-compose exec postgres pg_isready -U postgres -d payment_api > /dev/null 2>&1; do
    echo "   Aguardando PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL está pronto!"

# Aguardar o Redis estar pronto
echo "⏳ Aguardando Redis estar pronto..."
until docker-compose exec redis redis-cli ping > /dev/null 2>&1; do
    echo "   Aguardando Redis..."
    sleep 2
done

echo "✅ Redis está pronto!"

# Executar migrações (quando implementadas)
echo "📦 Executando migrações..."
bun run db:generate
bun run db:migrate

echo "✅ Ambiente de desenvolvimento configurado com sucesso!"
echo ""
echo "📊 Serviços disponíveis:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - Database: payment_api"
echo "   - User: postgres"
echo "   - Password: password"
echo ""
echo "🧪 Para testar a conexão:"
echo "   bun test-db-connection.js"
echo ""
echo "🚀 Para iniciar a aplicação:"
echo "   bun run dev"
