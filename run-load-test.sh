#!/usr/bin/env bash

# Script de teste de carga para Payment API usando Gatling
# Testa os endpoints: /login, /payments, /transactions

GATLING_BIN_DIR=./gatling-charts-highcharts-bundle-3.10.3
RESULTS_WORKSPACE="$(pwd)/load-test/user-files/results"
GATLING_BIN_DIR=$GATLING_BIN_DIR/bin
GATLING_WORKSPACE="$(pwd)/load-test/user-files"

runGatling() {
    sh $GATLING_BIN_DIR/gatling.sh -rm local -s PaymentApiLoadTestSimulation \
    -rd "Payment API Load Test - Observabilidade" \
    -rf $RESULTS_WORKSPACE \
    -sf "$GATLING_WORKSPACE/simulations"
}

startTest() {
    echo "🚀 Iniciando teste de carga da Payment API..."
    echo "📊 Endpoints a serem testados:"
    echo "   - POST /api/v1/auth/login"
    echo "   - GET /api/v1/payments"
    echo "   - GET /api/v1/transactions"
    echo "   - GET /health"
    echo ""
    
    for i in {1..3}; do
        echo "🔄 Tentativa $i - Aquecendo a aplicação..."
        
        # Aquecer a aplicação com algumas requisições
        curl --fail -s http://localhost:3000/health > /dev/null && \
        curl --fail -s http://localhost:3000/api/v1/auth/me > /dev/null && \
        echo "✅ Aplicação aquecida!" && \
        runGatling && \
        break || sleep 3;
    done
    
    echo ""
    echo "📈 Teste de carga concluído!"
    echo "🔍 Verifique os resultados em: $RESULTS_WORKSPACE"
    echo "📊 Verifique as métricas no Grafana: http://localhost:3001"
    echo "🔍 Verifique os traces no Jaeger: http://localhost:16686"
}

# Verificar se o Gatling está instalado
if [ ! -d "$GATLING_BIN_DIR" ]; then
    echo "❌ Gatling não encontrado em $GATLING_BIN_DIR"
    echo "📥 Baixando Gatling..."
    
    # Criar diretório se não existir
    mkdir -p gatling-charts-highcharts-bundle-3.10.3
    
    # Baixar Gatling (versão 3.10.3)
    curl -L -o gatling-charts-highcharts-bundle-3.10.3.zip \
        "https://repo1.maven.org/maven2/io/gatling/highcharts/gatling-charts-highcharts-bundle/3.10.3/gatling-charts-highcharts-bundle-3.10.3-bundle.zip"
    
    # Extrair
    unzip -q gatling-charts-highcharts-bundle-3.10.3.zip
    rm gatling-charts-highcharts-bundle-3.10.3.zip
    
    echo "✅ Gatling instalado com sucesso!"
fi

# Verificar se a aplicação está rodando
echo "🔍 Verificando se a aplicação está rodando..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Payment API está rodando em http://localhost:3000"
else
    echo "❌ Payment API não está rodando!"
    echo "🚀 Execute: docker-compose up -d"
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
echo "🎯 Iniciando teste de carga..."
startTest
