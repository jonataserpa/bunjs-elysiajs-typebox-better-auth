import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

// Importar rotas
import { authRoutes } from './presentation/routes/auth.routes';
import { paymentRoutes } from './presentation/routes/payment.routes';
import { tenantRoutes } from './presentation/routes/tenant.routes';
import { transactionRoutes } from './presentation/routes/transaction.routes';
import { healthRoutes } from './presentation/routes/health.routes';

// Importar middleware
import { simpleCorsMiddleware, simpleValidationMiddleware, simpleLoggingMiddleware } from './presentation/middleware/simple.middleware';
import { appConfig } from './shared/config/app.config';

export const app = new Elysia()
  // Middleware global
  .use(simpleLoggingMiddleware)
  .use(simpleValidationMiddleware)
  .use(simpleCorsMiddleware)
  
  // Configurações básicas
  .use(
    cors({
      origin: appConfig.cors.origin,
      credentials: appConfig.cors.credentials,
      methods: appConfig.cors.methods,
      allowedHeaders: appConfig.cors.allowedHeaders,
    })
  )

  // Documentação OpenAPI/Swagger
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Payment API',
          version: '1.0.0',
          description: `
# Payment API

API de pagamentos multi-tenant construída com Clean Architecture, Domain-Driven Design (DDD) e Test-Driven Development (TDD).

## Características

- **Multi-tenant**: Suporte completo para múltiplos tenants
- **Clean Architecture**: Separação clara de responsabilidades em camadas
- **DDD**: Modelagem baseada em domínio de negócio
- **TDD**: Desenvolvimento orientado a testes
- **Múltiplos Providers**: Suporte para Stripe e Pagar.me
- **Autenticação JWT**: Sistema de autenticação robusto
- **Webhooks**: Notificações em tempo real
- **Rate Limiting**: Controle de taxa de requisições
- **Logging**: Sistema de logs estruturado

## Providers Suportados

- **Stripe**: Gateway de pagamento internacional
- **Pagar.me**: Gateway de pagamento brasileiro

## Fluxo de Pagamento

1. **Criação**: Pagamento é criado com status PENDING
2. **Autorização**: Pagamento é autorizado (se necessário)
3. **Captura**: Pagamento é capturado (automática ou manual)
4. **Reembolso**: Pagamento pode ser reembolsado (parcial ou total)

## Autenticação

Todos os endpoints protegidos requerem um token JWT no header:
\`Authorization: Bearer <token>\`

## Rate Limiting

- **Limite**: 100 requisições por 15 minutos
- **Headers de resposta**: Incluem informações sobre o limite atual
          `,
          contact: {
            name: 'Payment API Team',
            email: 'team@payment-api.com',
            url: 'https://payment-api.com',
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
          },
        },
        servers: [
          {
            url: 'http://0.0.0.0:3000',
            description: 'Development server (Docker)',
          },
          {
            url: 'http://localhost:3000',
            description: 'Local development server',
          },
          {
            url: 'https://api.payment-api.com',
            description: 'Production server',
          },
        ],
        tags: [
          {
            name: 'Auth',
            description: 'Autenticação e autorização de usuários',
          },
          {
            name: 'Health',
            description: 'Endpoints para verificação de saúde da API e dependências',
          },
          {
            name: 'Payments',
            description: 'Processamento de pagamentos, captura, reembolsos e consultas',
          },
          {
            name: 'Transactions',
            description: 'Gerenciamento de transações, histórico e auditoria',
          },
          {
            name: 'Tenants',
            description: 'Gerenciamento de tenants, configurações e usuários',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Token JWT para autenticação',
            },
            tenantAuth: {
              type: 'apiKey',
              in: 'header',
              name: 'X-Tenant-ID',
              description: 'ID do tenant para identificação multi-tenant',
            },
          },
          schemas: {
            Error: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Tipo do erro' },
                message: { type: 'string', description: 'Mensagem de erro' },
                timestamp: { type: 'string', format: 'date-time', description: 'Timestamp do erro' },
                details: { type: 'object', description: 'Detalhes adicionais do erro' },
              },
              required: ['error', 'message', 'timestamp'],
            },
            ValidationError: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Validation Error' },
                message: { type: 'string', description: 'Mensagem de validação' },
                timestamp: { type: 'string', format: 'date-time' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
              required: ['error', 'message', 'timestamp'],
            },
          },
        },
        security: [
          { bearerAuth: [] },
          { tenantAuth: [] },
        ],
      },
      path: '/docs',
    })
  )

  // Middleware global de logging
  .onRequest(({ request }) => {
    console.log(
      `${new Date().toISOString()} - ${request.method} ${request.url}`
    );
  })

  // Middleware global de tratamento de erros
  .onError(({ error, set }) => {
    console.error('Error:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Validation')) {
      set.status = 400;
      return {
        error: 'Validation Error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }

    if (errorMessage.includes('Unauthorized')) {
      set.status = 401;
      return {
        error: 'Unauthorized',
        message: 'Invalid credentials or token',
        timestamp: new Date().toISOString(),
      };
    }

    if (errorMessage.includes('Forbidden')) {
      set.status = 403;
      return {
        error: 'Forbidden',
        message: 'Access denied',
        timestamp: new Date().toISOString(),
      };
    }

    if (errorMessage.includes('Not Found')) {
      set.status = 404;
      return {
        error: 'Not Found',
        message: 'Resource not found',
        timestamp: new Date().toISOString(),
      };
    }

    // Erro interno do servidor
    set.status = 500;
    return {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };
  })

  // Rotas de health check
  .use(healthRoutes)

  // Rotas de autenticação
  .use(authRoutes)

  // Rotas de pagamento
  .use(paymentRoutes)

  // Rotas de tenant
  .use(tenantRoutes)

  // Rotas de transações
  .use(transactionRoutes)

  // Rota padrão
  .get('/', () => ({
    message: 'Payment API - Multi-tenant Payment Processing',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health',
    timestamp: new Date().toISOString(),
  }))

  // Favicon para evitar 404 errors
  .get('/favicon.ico', ({ set }) => {
    set.status = 204;
    return;
  })

  // Endpoint de métricas para Prometheus
  .get('/metrics', ({ set }) => {
    set.headers = {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
    };
    return '# Métricas da Payment API\n# Este endpoint será usado pelo Prometheus\n';
  })

  // Endpoint simples para testar
  .get('/test', () => {
    console.log('🔍 Endpoint /test chamado');
    return {
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
    };
  })

  // Endpoint para testar traces
  .get('/test-trace', async () => {
    console.log('🔍 Testando criação de trace...');
    
    try {
      const { trace } = await import('@opentelemetry/api');
      console.log('✅ OpenTelemetry API importado');
      
      const tracer = trace.getTracer('payment-api-test');
      console.log('✅ Tracer criado');
      
      const span = tracer.startSpan('test-span');
      console.log('✅ Span iniciado');
      
      span.setAttributes({
        'test.attribute': 'test-value',
        'test.timestamp': new Date().toISOString(),
      });
      
      span.end();
      console.log('✅ Span finalizado');
      
      return {
        message: 'Test trace created successfully',
        timestamp: new Date().toISOString(),
        status: 'success'
      };
    } catch (error) {
      console.error('❌ Error creating trace:', error);
      return {
        message: 'Error creating trace',
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'error'
      };
    }
  })

  // Middleware de 404 para rotas não encontradas
  .onError(({ set, code }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        error: 'Not Found',
        message: 'The requested resource was not found',
        timestamp: new Date().toISOString(),
      };
    }
    
    // Erro padrão para outros casos
    set.status = 500;
    return {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };
  });

export default app;
