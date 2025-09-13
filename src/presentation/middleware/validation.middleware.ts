import { Elysia, t, type TSchema } from 'elysia';
import { logger } from '@/infrastructure/logging/Logger';

/**
 * Middleware de validação de entrada
 */
export const validationMiddleware = new Elysia({ name: 'validation-middleware' })
  .onError(({ error, code, set }) => {
    if (code === 'VALIDATION') {
      logger.warn('Erro de validação', 'ValidationMiddleware', {
        error: error.message,
        validationErrors: []
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
 * Schema de resposta padrão para erros
 */
export const errorResponseSchema = t.Object({
  success: t.Boolean({ default: false }),
  error: t.String(),
  details: t.Optional(t.Union([t.String(), t.Array(t.String())])),
  timestamp: t.String()
});

/**
 * Schema de resposta padrão para sucesso
 */
export const successResponseSchema = <T extends TSchema>(dataSchema: T) => t.Object({
  success: t.Boolean({ default: true }),
  data: dataSchema,
  timestamp: t.String()
});

/**
 * Schema de resposta paginada
 */
export const paginatedResponseSchema = <T extends TSchema>(itemSchema: T) => t.Object({
  success: t.Boolean({ default: true }),
  data: t.Array(itemSchema),
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
    hasNext: t.Boolean(),
    hasPrev: t.Boolean()
  }),
  timestamp: t.String()
});

/**
 * Middleware para validação de paginação
 */
export const paginationSchema = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  sort: t.Optional(t.String({ default: 'createdAt' })),
  order: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')], { default: 'desc' }))
});

/**
 * Middleware para validação de filtros de data
 */
export const dateFilterSchema = t.Object({
  startDate: t.Optional(t.String({ format: 'date' })),
  endDate: t.Optional(t.String({ format: 'date' })),
  timezone: t.Optional(t.String({ default: 'UTC' }))
});

/**
 * Middleware para validação de ID
 */
export const idSchema = t.Object({
  id: t.String({ minLength: 1, description: 'ID do recurso' })
});

/**
 * Middleware para validação de tenant ID
 */
export const tenantIdSchema = t.Object({
  tenantId: t.String({ minLength: 1, description: 'ID do tenant' })
});

/**
 * Middleware para sanitização de entrada
 */
export const sanitizationMiddleware = new Elysia({ name: 'sanitization-middleware' })
  .onParse(({ body }) => {
    if (typeof body === 'string') {
      // Remove caracteres perigosos e normaliza espaços
      return body
        .replace(/[<>]/g, '') // Remove < e >
        .replace(/\s+/g, ' ') // Normaliza espaços
        .trim();
    }
    return body;
  });

/**
 * Middleware para rate limiting básico
 */
export const rateLimitMiddleware = new Elysia({ name: 'rate-limit-middleware' })
  .derive(({ request, headers }) => {
    const ip = headers['x-forwarded-for'] || 'unknown';
    const key = `rate_limit:${ip}`;
    
    // TODO: Implementar rate limiting com Redis
    // Por enquanto, apenas log da tentativa
    logger.debug('Rate limit check', 'RateLimitMiddleware', { ip, key });
    
    return { rateLimitKey: key };
  });

/**
 * Middleware para CORS personalizado
 */
export const corsMiddleware = new Elysia({ name: 'cors-middleware' })
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
 * Middleware para logging de requisições
 */
export const requestLoggingMiddleware = new Elysia({ name: 'request-logging' })
  .onRequest(({ request }) => {
    logger.info('Requisição recebida', 'RequestLogging', {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
  })
  .onAfterHandle(({ request, response }) => {
    logger.info('Resposta enviada', 'RequestLogging', {
      method: request.method,
      url: request.url,
      status: 200,
      responseTime: Date.now() // TODO: Calcular tempo de resposta real
    });
  });
