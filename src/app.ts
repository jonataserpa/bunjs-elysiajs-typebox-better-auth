import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

// Importar rotas
import { authRoutes } from '@/presentation/routes/auth.routes';
// import { paymentRoutes } from '@/presentation/routes/payment.routes';
// import { tenantRoutes } from '@/presentation/routes/tenant.routes';
import { healthRoutes } from '@/presentation/routes/health.routes';

// Importar middleware
import { simpleCorsMiddleware, simpleValidationMiddleware, simpleLoggingMiddleware } from '@/presentation/middleware/simple.middleware';
import { logger } from '@/infrastructure/logging/Logger';
import { appConfig } from '@/shared/config/app.config';

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
          description:
            'API de pagamentos multi-tenant com Clean Architecture, DDD e TDD',
          contact: {
            name: 'Payment API Team',
            email: 'team@payment-api.com',
          },
        },
        servers: [
          {
            url: 'http://0.0.0.0:3000',
            description: 'Development server',
          },
          {
            url: 'http://localhost:3000',
            description: 'Local development server',
          },
        ],
        tags: [
          {
            name: 'Health',
            description: 'Health check endpoints',
          },
          {
            name: 'Auth',
            description: 'Authentication and authorization endpoints',
          },
          {
            name: 'Payments',
            description: 'Payment processing endpoints',
          },
          {
            name: 'Tenants',
            description: 'Tenant management endpoints',
          },
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
  // .use(paymentRoutes)

  // Rotas de tenant
  // .use(tenantRoutes)

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
