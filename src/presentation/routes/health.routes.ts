import { Elysia } from 'elysia';
import { Type } from '@sinclair/typebox';

// Schemas para validação
const HealthResponseSchema = Type.Object({
  status: Type.String(),
  timestamp: Type.String(),
  uptime: Type.Number(),
  version: Type.String(),
  environment: Type.String(),
});

const ReadinessResponseSchema = Type.Object({
  status: Type.String(),
  checks: Type.Object({
    database: Type.String(),
    redis: Type.String(),
    external_apis: Type.String(),
  }),
  timestamp: Type.String(),
});

const LivenessResponseSchema = Type.Object({
  status: Type.String(),
  timestamp: Type.String(),
});

export const healthRoutes = new Elysia({ prefix: '/health' })
  .get(
    '/',
    () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      };
    },
    {
      response: HealthResponseSchema,
      detail: {
        tags: ['Health'],
        summary: 'Health Check',
        description: 'Returns the overall health status of the API',
      },
    }
  )
  .get(
    '',
    () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      };
    },
    {
      response: HealthResponseSchema,
      detail: {
        tags: ['Health'],
        summary: 'Health Check',
        description: 'Returns the overall health status of the API',
      },
    }
  )

  .get(
    '/ready',
    () => {
      // TODO: Implementar verificações reais quando os serviços estiverem configurados
      const checks = {
        database: 'ok', // TODO: Verificar conexão com PostgreSQL
        redis: 'ok', // TODO: Verificar conexão com Redis
        external_apis: 'ok', // TODO: Verificar APIs externas (Stripe, Pagar.me)
      };

      return {
        status: 'ready',
        checks,
        timestamp: new Date().toISOString(),
      };
    },
    {
      response: ReadinessResponseSchema,
      detail: {
        tags: ['Health'],
        summary: 'Readiness Check',
        description:
          'Returns the readiness status of the API and its dependencies',
      },
    }
  )

  .get(
    '/live',
    () => {
      return {
        status: 'alive',
        timestamp: new Date().toISOString(),
      };
    },
    {
      response: LivenessResponseSchema,
      detail: {
        tags: ['Health'],
        summary: 'Liveness Check',
        description: 'Returns the liveness status of the API',
      },
    }
  );
