import { Elysia } from 'elysia';
import { Type } from '@sinclair/typebox';
import { TracingUtil } from '../../shared/utils/tracing.util';

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
      const span = TracingUtil.createHttpSpan(
        'GET /health',
        'GET',
        '/health'
      );

      try {
        span.addEvent('health.check.started');
        
        const response = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
        };

        span.addEvent('health.check.completed', {
          uptime: response.uptime,
          environment: response.environment
        });

        span.setStatus(200);
        span.end();
        
        return response;
      } catch (error) {
        span.setStatus(500, error as Error);
        span.end();
        throw error;
      }
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
      const span = TracingUtil.createHttpSpan(
        'GET /health',
        'GET',
        '/health'
      );

      try {
        span.addEvent('health.check.started');
        
        const response = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
        };

        span.addEvent('health.check.completed', {
          uptime: response.uptime,
          environment: response.environment
        });

        span.setStatus(200);
        span.end();
        
        return response;
      } catch (error) {
        span.setStatus(500, error as Error);
        span.end();
        throw error;
      }
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
      const span = TracingUtil.createHttpSpan(
        'GET /health/ready',
        'GET',
        '/health/ready'
      );

      try {
        span.addEvent('health.readiness.started');
        
        // TODO: Implementar verificações reais quando os serviços estiverem configurados
        const checks = {
          database: 'ok', // TODO: Verificar conexão com PostgreSQL
          redis: 'ok', // TODO: Verificar conexão com Redis
          external_apis: 'ok', // TODO: Verificar APIs externas (Stripe, Pagar.me)
        };

        span.addEvent('health.readiness.checks_completed', {
          databaseStatus: checks.database,
          redisStatus: checks.redis,
          externalApisStatus: checks.external_apis
        });

        const response = {
          status: 'ready',
          checks,
          timestamp: new Date().toISOString(),
        };

        span.setStatus(200);
        span.end();
        
        return response;
      } catch (error) {
        span.setStatus(500, error as Error);
        span.end();
        throw error;
      }
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
      const span = TracingUtil.createHttpSpan(
        'GET /health/live',
        'GET',
        '/health/live'
      );

      try {
        span.addEvent('health.liveness.started');
        
        const response = {
          status: 'alive',
          timestamp: new Date().toISOString(),
        };

        span.addEvent('health.liveness.completed');
        
        span.setStatus(200);
        span.end();
        
        return response;
      } catch (error) {
        span.setStatus(500, error as Error);
        span.end();
        throw error;
      }
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
