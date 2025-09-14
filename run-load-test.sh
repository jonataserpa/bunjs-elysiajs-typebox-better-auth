#!/usr/bin/env bash

# Script de teste de carga para Payment API usando Gatling via Docker
# Testa os endpoints: /login, /payments, /transactions

echo "🚀 Iniciando teste de carga da Payment API com Gatling..."
echo "📊 Endpoints a serem testados:"
echo "   - POST /api/v1/auth/login"
echo "   - GET /api/v1/payments"
echo "   - GET /api/v1/transactions"
echo "   - GET /health"
echo ""

# Verificar se a aplicação está rodando
echo "🔍 Verificando se a aplicação está rodando..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Payment API está rodando em http://localhost:3000"
else
    echo "❌ Payment API não está rodando!"
    echo "🚀 Execute: docker-compose up -d payment-api"
    exit 1
fi

# Verificar se os serviços de observabilidade estão rodando
echo "🔍 Verificando serviços de observabilidade..."
if curl -s http://localhost:9090/-/healthy > /dev/null; then
    echo "✅ Prometheus está rodando"
else
    echo "⚠️  Prometheus não está rodando"
fi

if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Grafana está rodando"
else
    echo "⚠️  Grafana não está rodando"
fi

if curl -s http://localhost:16686/api/services > /dev/null; then
    echo "✅ Jaeger está rodando"
else
    echo "⚠️  Jaeger não está rodando"
fi

echo ""
echo "🎯 Iniciando teste de carga com Gatling..."

# Aguardar um pouco para garantir que a aplicação está estável
echo "⏳ Aguardando estabilização da aplicação..."
sleep 10

# Executar o teste de carga com Gatling
echo "🚀 Executando Gatling Load Test..."
docker-compose --profile testing up gatling

echo ""
echo "📈 Teste de carga concluído!"
echo "📊 Verifique os resultados em: ./load-test/results/"
echo "📊 Verifique as métricas no Grafana: http://localhost:3001"
echo "🔍 Verifique os traces no Jaeger: http://localhost:16686"

# Mostrar os arquivos de resultado mais recentes
echo ""
echo "📋 Resultados mais recentes:"
ls -la load-test/results/ | tail -5