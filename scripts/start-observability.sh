#!/bin/bash

# Script para inicializar a infraestrutura de observabilidade
# Payment API - Observability Setup

set -e

echo "🚀 Iniciando infraestrutura de observabilidade da Payment API..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    print_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se docker-compose está disponível
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose não está instalado."
    exit 1
fi

print_status "Verificando arquivos de configuração..."

# Verificar se os arquivos necessários existem
required_files=(
    "docker-compose.yml"
    "infra/otel-collector-config.yaml"
    "infra/prometheus.yaml"
    "infra/grafana/provisioning/datasources/prometheus.yml"
    "infra/grafana/dashboards/payment-api-overview.json"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Arquivo necessário não encontrado: $file"
        exit 1
    fi
done

print_success "Todos os arquivos de configuração estão presentes."

# Parar serviços existentes
print_status "Parando serviços existentes..."
docker-compose down > /dev/null 2>&1 || true

# Remover volumes se solicitado
if [ "$1" = "--clean" ]; then
    print_warning "Removendo volumes existentes..."
    docker-compose down -v > /dev/null 2>&1 || true
fi

# Build da aplicação se necessário
if [ "$1" = "--build" ] || [ "$1" = "--clean" ]; then
    print_status "Fazendo build da Payment API..."
    docker-compose build payment-api
fi

# Subir os serviços
print_status "Subindo serviços de observabilidade..."

# Subir infraestrutura primeiro
docker-compose up -d postgres redis otel-collector jaeger prometheus grafana

print_status "Aguardando infraestrutura ficar pronta..."
sleep 30

# Verificar saúde dos serviços
print_status "Verificando saúde dos serviços..."

services=(
    "postgres:5432"
    "redis:6379"
    "otel-collector:13133"
    "jaeger:16686"
    "prometheus:9090"
    "grafana:3000"
)

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if nc -z localhost $port 2>/dev/null; then
        print_success "$name está rodando na porta $port"
    else
        print_warning "$name ainda não está respondendo na porta $port"
    fi
done

# Subir a aplicação
print_status "Subindo Payment API..."
docker-compose up -d payment-api

print_status "Aguardando Payment API ficar pronta..."
sleep 15

# Verificar se a API está respondendo
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Payment API está rodando!"
else
    print_warning "Payment API ainda não está respondendo. Verifique os logs:"
    echo "docker-compose logs payment-api"
fi

# Mostrar status final
echo ""
print_success "Infraestrutura de observabilidade iniciada com sucesso!"
echo ""
echo "🌐 Serviços disponíveis:"
echo "  • Payment API:      http://localhost:3000"
echo "  • Swagger Docs:     http://localhost:3000/docs"
echo "  • Grafana:          http://localhost:3001 (admin/admin123)"
echo "  • Prometheus:       http://localhost:9090"
echo "  • Jaeger:           http://localhost:16686"
echo ""
echo "📊 Dashboards disponíveis:"
echo "  • Payment API Overview (Grafana)"
echo "  • Prometheus Targets"
echo "  • Jaeger Service Map"
echo ""
echo "🧪 Para executar testes de carga:"
echo "  docker-compose --profile testing up gatling"
echo ""
echo "📝 Para ver logs:"
echo "  docker-compose logs -f [service-name]"
echo ""
echo "🛑 Para parar tudo:"
echo "  docker-compose down"
echo ""

# Verificar se há algum problema
print_status "Verificando status final dos serviços..."
docker-compose ps
