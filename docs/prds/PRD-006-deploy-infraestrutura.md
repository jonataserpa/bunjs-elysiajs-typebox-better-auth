# PRD-006: Deploy e Infraestrutura com Docker e Kubernetes

## 1. Visão Geral

### 1.1 Objetivo
Implementar uma infraestrutura robusta, escalável e moderna utilizando Docker e Kubernetes para deploy da API de pagamentos, garantindo alta disponibilidade, escalabilidade automática e facilidade de manutenção.

### 1.2 Escopo
- Containerização com Docker
- Orquestração com Kubernetes
- CI/CD automatizado
- Monitoramento e observabilidade
- Backup e recuperação
- Segurança e compliance

### 1.3 Critérios de Sucesso
- Deploy automatizado e confiável
- Escalabilidade horizontal automática
- Alta disponibilidade (99.9%+)
- Tempo de deploy < 5 minutos
- Rollback rápido em caso de problemas
- Monitoramento em tempo real

## 2. Requisitos Funcionais

### 2.1 Containerização
- **RF-001**: Dockerfile otimizado para produção
- **RF-002**: Multi-stage build para binário único
- **RF-003**: Imagem Docker mínima e segura
- **RF-004**: Suporte a múltiplas arquiteturas
- **RF-005**: Variáveis de ambiente configuráveis
- **RF-006**: Health checks integrados

### 2.2 Orquestração Kubernetes
- **RF-007**: Deployments com rolling updates
- **RF-008**: Services para load balancing
- **RF-009**: ConfigMaps para configurações
- **RF-010**: Secrets para dados sensíveis
- **RF-011**: Ingress para roteamento externo
- **RF-012**: PersistentVolumes para dados

### 2.3 Escalabilidade
- **RF-013**: Horizontal Pod Autoscaler (HPA)
- **RF-014**: Vertical Pod Autoscaler (VPA)
- **RF-015**: Cluster Autoscaler
- **RF-016**: Métricas customizadas para scaling
- **RF-017**: Scaling baseado em CPU e memória
- **RF-018**: Scaling baseado em métricas de negócio

### 2.4 Monitoramento
- **RF-019**: Métricas de aplicação
- **RF-020**: Logs centralizados
- **RF-021**: Alertas proativos
- **RF-022**: Dashboards de observabilidade
- **RF-023**: Tracing distribuído
- **RF-024**: Health checks e readiness probes

## 3. Requisitos Não Funcionais

### 3.1 Performance
- **RNF-001**: Tempo de startup < 30 segundos
- **RNF-002**: Escalabilidade para 1000+ pods
- **RNF-003**: Throughput > 10.000 req/s
- **RNF-004**: Latência < 100ms (p95)
- **RNF-005**: Zero downtime durante deployments

### 3.2 Confiabilidade
- **RNF-006**: Disponibilidade > 99.9%
- **RNF-007**: RTO (Recovery Time Objective) < 5 minutos
- **RNF-008**: RPO (Recovery Point Objective) < 1 minuto
- **RNF-009**: Backup automático diário
- **RNF-010**: Disaster recovery automatizado

### 3.3 Segurança
- **RNF-011**: Imagens Docker escaneadas
- **RNF-012**: Secrets criptografados
- **RNF-013**: Network policies
- **RNF-014**: RBAC configurado
- **RNF-015**: Compliance com LGPD/GDPR

### 3.4 Operabilidade
- **RNF-016**: Deploy automatizado via CI/CD
- **RNF-017**: Rollback em < 2 minutos
- **RNF-018**: Logs estruturados e pesquisáveis
- **RNF-019**: Alertas via Slack/email
- **RNF-020**: Documentação de operação

## 4. Arquitetura de Infraestrutura

### 4.1 Arquitetura Kubernetes
```
┌─────────────────────────────────────────────────────────────────┐
│                        KUBERNETES CLUSTER                      │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   NAMESPACE     │  │   NAMESPACE     │  │   NAMESPACE     │ │
│  │   PRODUCTION    │  │   STAGING       │  │   DEVELOPMENT   │ │
│  │                 │  │                 │  │                 │ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │ │
│  │ │   INGRESS   │ │  │ │   INGRESS   │ │  │ │   INGRESS   │ │ │
│  │ │  CONTROLLER │ │  │ │  CONTROLLER │ │  │ │  CONTROLLER │ │ │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │ │
│  │                 │  │                 │  │                 │ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │ │
│  │ │   SERVICE   │ │  │ │   SERVICE   │ │  │ │   SERVICE   │ │ │
│  │ │   (Load     │ │  │ │   (Load     │ │  │ │   (Load     │ │ │
│  │ │   Balancer) │ │  │ │   Balancer) │ │  │ │   Balancer) │ │ │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │ │
│  │                 │  │                 │  │                 │ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │ │
│  │ │ DEPLOYMENT  │ │  │ │ DEPLOYMENT  │ │  │ │ DEPLOYMENT  │ │ │
│  │ │   (API      │ │  │ │   (API      │ │  │ │   (API      │ │ │
│  │ │   Pods)     │ │  │ │   Pods)     │ │  │ │   Pods)     │ │ │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │ │
│  │                 │  │                 │  │                 │ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │ │
│  │ │   SECRET    │ │  │ │   SECRET    │ │  │ │   SECRET    │ │ │
│  │ │  CONFIGMAP  │ │  │ │  CONFIGMAP  │ │  │ │  CONFIGMAP  │ │ │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  SHARED SERVICES                           │ │
│  │                                                             │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │ │  POSTGRES   │ │   REDIS     │ │  PROMETHEUS │           │ │
│  │ │  DATABASE   │ │   CACHE     │ │  MONITORING │           │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  │                                                             │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │ │   GRAFANA   │ │   JAEGER    │ │   ELK STACK │           │ │
│  │ │ DASHBOARDS  │ │   TRACING   │ │    LOGS     │           │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Dockerfile Otimizado
```dockerfile
# Multi-stage build para binário único
FROM oven/bun:alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache ca-certificates tzdata

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json bun.lockb ./

# Instalar dependências
RUN bun install --frozen-lockfile --production

# Copiar código fonte
COPY . .

# Compilar aplicação para binário único
RUN bun build src/index.ts --compile --outfile payment-api --target bun

# Stage de produção
FROM alpine:latest

# Instalar dependências mínimas
RUN apk add --no-cache ca-certificates tzdata

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S payment -u 1001

# Configurar diretório de trabalho
WORKDIR /app

# Copiar binário do stage anterior
COPY --from=builder /app/payment-api .

# Copiar arquivos de configuração
COPY --from=builder /app/src/infrastructure/database/migrations ./migrations

# Definir propriedade dos arquivos
RUN chown -R payment:nodejs /app

# Mudar para usuário não-root
USER payment

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicialização
CMD ["./payment-api"]
```

## 5. Configurações Kubernetes

### 5.1 Namespace
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: payment-api
  labels:
    name: payment-api
    environment: production
```

### 5.2 ConfigMap
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: payment-api-config
  namespace: payment-api
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  DATABASE_HOST: "postgres-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "payment_api"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  JWT_SECRET: "change-me-in-production"
  STRIPE_PUBLISHABLE_KEY: "pk_test_..."
  PAGARME_PUBLISHABLE_KEY: "ak_test_..."
```

### 5.3 Secret
```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: payment-api-secrets
  namespace: payment-api
type: Opaque
data:
  DATABASE_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-jwt-secret>
  STRIPE_SECRET_KEY: <base64-encoded-stripe-key>
  PAGARME_SECRET_KEY: <base64-encoded-pagarme-key>
  ENCRYPTION_KEY: <base64-encoded-encryption-key>
```

### 5.4 Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-api
  namespace: payment-api
  labels:
    app: payment-api
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: payment-api
  template:
    metadata:
      labels:
        app: payment-api
        version: v1.0.0
    spec:
      containers:
      - name: payment-api
        image: payment-api:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: payment-api-config
              key: NODE_ENV
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: payment-api-secrets
              key: DATABASE_PASSWORD
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
```

### 5.5 Service
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: payment-api-service
  namespace: payment-api
  labels:
    app: payment-api
spec:
  selector:
    app: payment-api
  ports:
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
  type: ClusterIP
```

### 5.6 Ingress
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: payment-api-ingress
  namespace: payment-api
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.payment.example.com
    secretName: payment-api-tls
  rules:
  - host: api.payment.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: payment-api-service
            port:
              number: 80
```

### 5.7 Horizontal Pod Autoscaler
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: payment-api-hpa
  namespace: payment-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: payment-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

## 6. CI/CD Pipeline

### 6.1 GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: payment_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Bun
      uses: oven-sh/setup-bun@v1
      with:
        bun-version: latest

    - name: Install dependencies
      run: bun install

    - name: Run tests
      run: bun run test:ci

    - name: Generate coverage report
      run: bun run test:coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3

    - name: Configure kubectl
      uses: azure/k8s-set-context@v3
      with:
        method: kubeconfig
        kubeconfig: ${{ secrets.KUBE_CONFIG }}

    - name: Deploy to Kubernetes
      run: |
        # Atualizar imagem no deployment
        kubectl set image deployment/payment-api payment-api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest -n payment-api
        
        # Aguardar rollout
        kubectl rollout status deployment/payment-api -n payment-api --timeout=300s

    - name: Verify deployment
      run: |
        kubectl get pods -n payment-api
        kubectl get services -n payment-api
```

### 6.2 Helm Chart
```yaml
# helm/payment-api/Chart.yaml
apiVersion: v2
name: payment-api
description: Payment API Helm Chart
type: application
version: 0.1.0
appVersion: "1.0.0"

# helm/payment-api/values.yaml
replicaCount: 3

image:
  repository: ghcr.io/your-org/payment-api
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: api.payment.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: payment-api-tls
      hosts:
        - api.payment.example.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity: {}
```

## 7. Monitoramento e Observabilidade

### 7.1 Prometheus Config
```yaml
# monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    rule_files:
      - "payment-api-rules.yml"

    scrape_configs:
    - job_name: 'payment-api'
      static_configs:
      - targets: ['payment-api-service:80']
      metrics_path: '/metrics'
      scrape_interval: 5s

    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - payment-api
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### 7.2 Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Payment API Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

## 8. Backup e Disaster Recovery

### 8.1 Database Backup
```yaml
# backup/postgres-backup.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: payment-api
spec:
  schedule: "0 2 * * *" # Diário às 2h
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: postgres-backup
            image: postgres:15
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: payment-api-secrets
                  key: DATABASE_PASSWORD
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h postgres-service -U postgres payment_api > /backup/payment_api_$(date +%Y%m%d_%H%M%S).sql
              aws s3 cp /backup/ s3://payment-api-backups/ --recursive
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

### 8.2 Disaster Recovery Plan
```bash
#!/bin/bash
# disaster-recovery.sh

# 1. Restaurar banco de dados
kubectl exec -it postgres-pod -- psql -U postgres -d payment_api < backup.sql

# 2. Restaurar configurações
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 3. Restaurar aplicação
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# 4. Verificar status
kubectl get pods -n payment-api
kubectl get services -n payment-api
kubectl get ingress -n payment-api

# 5. Testar aplicação
curl -f https://api.payment.example.com/health
```

## 9. Critérios de Aceitação

### 9.1 Deploy
- [ ] Deploy automatizado via CI/CD
- [ ] Rolling updates sem downtime
- [ ] Rollback em < 2 minutos
- [ ] Tempo de deploy < 5 minutos
- [ ] Verificação automática de saúde

### 9.2 Escalabilidade
- [ ] HPA configurado e funcionando
- [ ] Scaling baseado em CPU e memória
- [ ] Suporte a 1000+ pods
- [ ] Cluster autoscaler configurado

### 9.3 Monitoramento
- [ ] Métricas coletadas e visualizadas
- [ ] Logs centralizados e pesquisáveis
- [ ] Alertas configurados e funcionando
- [ ] Dashboards atualizados

### 9.4 Segurança
- [ ] Imagens Docker escaneadas
- [ ] Secrets criptografados
- [ ] Network policies configuradas
- [ ] RBAC implementado

## 10. Riscos e Mitigações

### 10.1 Riscos de Deploy
- **Risco**: Deploy com falhas em produção
  - **Mitigação**: Testes automatizados e staging environment
- **Risco**: Rollback lento
  - **Mitigação**: Blue-green deployment e versioning

### 10.2 Riscos de Escalabilidade
- **Risco**: Overprovisioning de recursos
  - **Mitigação**: HPA e VPA configurados corretamente
- **Risco**: Underprovisioning causando downtime
  - **Mitigação**: Monitoring e alertas proativos

## 11. Cronograma

### Fase 1: Containerização (1 semana)
- Dockerfile otimizado
- Multi-stage build
- Testes de imagem
- Registry setup

### Fase 2: Kubernetes Setup (1 semana)
- Cluster configuration
- Namespaces e RBAC
- Deployments e Services
- ConfigMaps e Secrets

### Fase 3: CI/CD Pipeline (1 semana)
- GitHub Actions setup
- Build e push automatizado
- Deploy automatizado
- Rollback automation

### Fase 4: Monitoramento (1 semana)
- Prometheus e Grafana
- Logs centralizados
- Alertas configurados
- Dashboards criados

## 12. Métricas de Sucesso

### 12.1 Métricas Operacionais
- Disponibilidade: > 99.9%
- Tempo de deploy: < 5 minutos
- Tempo de rollback: < 2 minutos
- Uptime: > 99.9%

### 12.2 Métricas de Performance
- Throughput: > 10.000 req/s
- Latência (p95): < 100ms
- Escalabilidade: 1000+ pods
- Tempo de startup: < 30 segundos

### 12.3 Métricas de Qualidade
- Zero downtime durante deploys
- Tempo de resolução de incidentes: < 1 hora
- Satisfação da equipe: > 8/10
- Zero falhas de segurança

## 13. Próximos Passos

1. **Configuração do ambiente de desenvolvimento**
2. **Criação do Dockerfile otimizado**
3. **Setup do cluster Kubernetes**
4. **Configuração dos namespaces e RBAC**
5. **Implementação dos Deployments e Services**
6. **Setup do CI/CD pipeline**
7. **Configuração do monitoramento**
8. **Implementação de backup e disaster recovery**
9. **Testes de carga e performance**
10. **Documentação e treinamento da equipe**
