import { Elysia, t } from 'elysia';
import { logger } from '@/infrastructure/logging/Logger';

/**
 * Middleware simplificado para validação
 */
export const simpleValidationMiddleware = new Elysia({ name: 'simple-validation-middleware' })
  .onError(({ error, code, set }) => {
    if (code === 'VALIDATION') {
      logger.warn('Erro de validação', 'SimpleValidationMiddleware', {
        error: error.message
      });

      set.status = 400;
      return {
        success: false,
        error: 'Dados de entrada inválidos',
        details: [error.message],
        timestamp: new Date().toISOString()
      };
    }
  });

/**
 * Middleware simplificado para CORS
 */
export const simpleCorsMiddleware = new Elysia({ name: 'simple-cors-middleware' })
  .onRequest(({ set, request }) => {
    const origin = request.headers.get('origin');
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    
    if (origin && allowedOrigins.includes(origin)) {
      set.headers['Access-Control-Allow-Origin'] = origin;
    }
    
    set.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    set.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Tenant-ID';
    set.headers['Access-Control-Allow-Credentials'] = 'true';
  })
  .onBeforeHandle(({ request, set }) => {
    if (request.method === 'OPTIONS') {
      set.status = 200;
      return '';
    }
  });

/**
 * Middleware simplificado para logs
 */
export const simpleLoggingMiddleware = new Elysia({ name: 'simple-logging-middleware' })
  .onRequest(({ request }) => {
    logger.info('Requisição recebida', 'SimpleLogging', {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
  });

/**
 * Schema simplificado para paginação
 */
export const simplePaginationSchema = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 }))
});

/**
 * Schema simplificado para ID
 */
export const simpleIdSchema = t.Object({
  id: t.String({ minLength: 1 })
});
