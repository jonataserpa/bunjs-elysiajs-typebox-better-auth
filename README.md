# Payment API - Multi-tenant Payment Processing

Uma API de pagamentos moderna construída com **Clean Architecture**, **Domain-Driven Design (DDD)** e **Test-Driven Development (TDD)**, utilizando Bun, Elysia.js e TypeScript.

## 🏗️ Arquitetura

Este projeto segue os princípios de **Clean Architecture** com as seguintes camadas:

- **Domain Layer**: Entidades, Value Objects, Domain Services e Interfaces
- **Application Layer**: Use Cases, Application Services e DTOs  
- **Infrastructure Layer**: Implementações concretas (Drizzle ORM, External APIs, Repositories)
- **Presentation Layer**: Controllers HTTP, DTOs de Request/Response e Validação

## 🚀 Stack Tecnológica

- **Runtime**: [Bun](https://bun.sh/) - JavaScript runtime moderno e performático
- **Framework**: [Elysia.js](https://elysiajs.com/) - Framework HTTP rápido e type-safe
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- **Validation**: [TypeBox](https://github.com/sinclairzx81/typebox) - Schemas e geração de OpenAPI
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - ORM moderno e type-safe
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Banco de dados relacional
- **Auth**: [Better Auth](https://better-auth.com/) - Autenticação local sem dependências externas
- **Payment Gateways**: Stripe e Pagar.me
- **Testing**: Bun Test - Suite de testes nativa do Bun
- **Containerization**: Docker + Kubernetes

## 📋 Funcionalidades

- ✅ **Multi-tenancy** - Isolamento completo por tenant
- ✅ **Autenticação JWT** - Sistema seguro sem dependências externas
- ✅ **Múltiplos Gateways** - Suporte a Stripe e Pagar.me
- ✅ **Documentação Automática** - OpenAPI/Swagger gerado automaticamente
- ✅ **Testes Abrangentes** - Unitários, integração e E2E
- ✅ **Escalabilidade** - Preparado para Kubernetes
- ✅ **Observabilidade** - Logs estruturados e métricas

## 🛠️ Pré-requisitos

- [Bun](https://bun.sh/) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 15
- [Redis](https://redis.io/) >= 7 (opcional para cache)

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd payment-bunjs
```

2. **Instale as dependências**
```bash
bun install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
# Crie o banco PostgreSQL
createdb payment_api

# Execute as migrações (quando implementadas)
bun run db:migrate
```

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
bun run dev
```

### Produção
```bash
bun run build
bun run start
```

### Testes
```bash
# Todos os testes
bun test

# Testes unitários
bun run test:unit

# Testes de integração
bun run test:integration

# Testes E2E
bun run test:e2e

# Com cobertura
bun run test:coverage
```

### Qualidade de Código
```bash
# Verificação de tipos
bun run type-check

# Linting
bun run lint

# Formatação
bun run format
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:
- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health
- **OpenAPI JSON**: http://localhost:3000/docs/json

## 🏗️ Estrutura do Projeto

```
src/
├── domain/                    # Camada de Domínio
│   ├── entities/             # Entidades de negócio
│   ├── value-objects/        # Value Objects
│   ├── services/             # Domain Services
│   ├── events/               # Domain Events
│   └── exceptions/           # Domain Exceptions
├── application/              # Camada de Aplicação
│   ├── use-cases/           # Casos de uso
│   ├── services/            # Application Services
│   ├── interfaces/          # Interfaces para inversão de dependência
│   └── mappers/             # Mapeadores entre camadas
├── infrastructure/           # Camada de Infraestrutura
│   ├── database/            # Drizzle ORM e migrações
│   ├── external/            # APIs externas (Stripe, Pagar.me)
│   ├── auth/                # Better Auth
│   └── logging/             # Sistema de logs
├── presentation/             # Camada de Apresentação
│   ├── controllers/         # Controllers HTTP
│   ├── routes/              # Definição de rotas
│   ├── dto/                 # Data Transfer Objects
│   ├── middleware/          # Middlewares HTTP
│   └── schemas/             # Schemas TypeBox
└── shared/                   # Código compartilhado
    ├── types/               # Tipos compartilhados
    ├── constants/           # Constantes
    ├── utils/               # Utilitários
    └── config/              # Configurações
```

## 🧪 Estratégia de Testes

O projeto utiliza **Test-Driven Development (TDD)** com a seguinte estrutura:

- **Testes Unitários**: Testam componentes isolados
- **Testes de Integração**: Testam integração entre módulos
- **Testes E2E**: Testam fluxos completos end-to-end
- **Testes de Performance**: Benchmarks e testes de carga

### Cobertura de Testes

- **Meta**: > 90% de cobertura
- **Ferramenta**: Bun Test com relatórios de cobertura
- **Estratégia**: TDD - testes primeiro, implementação depois

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `bun run dev` | Inicia o servidor em modo desenvolvimento |
| `bun run build` | Compila a aplicação para produção |
| `bun run start` | Inicia a aplicação compilada |
| `bun test` | Executa todos os testes |
| `bun run test:unit` | Executa apenas testes unitários |
| `bun run test:integration` | Executa apenas testes de integração |
| `bun run test:e2e` | Executa apenas testes E2E |
| `bun run test:coverage` | Executa testes com relatório de cobertura |
| `bun run lint` | Executa ESLint |
| `bun run format` | Formata código com Prettier |
| `bun run type-check` | Verifica tipos TypeScript |

## 🚀 Deploy

### Docker
```bash
# Build da imagem
docker build -t payment-api .

# Executar container
docker run -p 3000:3000 payment-api
```

### Kubernetes
```bash
# Aplicar manifests
kubectl apply -f k8s/

# Verificar status
kubectl get pods -n payment-api
```

## 📊 Monitoramento

- **Métricas**: Prometheus + Grafana
- **Logs**: Estruturados em JSON
- **Tracing**: Jaeger (planejado)
- **Health Checks**: Endpoints `/health`, `/health/ready`, `/health/live`

## 🔒 Segurança

- **Autenticação**: JWT com Better Auth
- **Autorização**: RBAC por tenant
- **Validação**: TypeBox schemas
- **HTTPS**: Obrigatório em produção
- **Rate Limiting**: Por tenant e endpoint
- **Secrets**: Criptografia AES-256

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

Consulte o arquivo [ROADMAP-IMPLEMENTACAO.md](docs/ROADMAP-IMPLEMENTACAO.md) para o cronograma detalhado de implementação.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Tech Lead**: [Nome do Tech Lead]
- **Backend Developer**: [Nome do Desenvolvedor]
- **DevOps Engineer**: [Nome do DevOps]
- **QA Engineer**: [Nome do QA]

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: team@payment-api.com
- 💬 Slack: #payment-api
- 📖 Documentação: [Link para documentação]
