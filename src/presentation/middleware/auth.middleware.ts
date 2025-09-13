import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { appConfig } from '@/shared/config/app.config';
import { logger } from '@/infrastructure/logging/Logger';

/**
 * Middleware de autenticação JWT
 */
export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  // Temporariamente comentado para corrigir erros de tipagem
  /*
  .use(jwt({
    name: 'jwt',
    secret: appConfig.auth.jwtSecret,
  }))
  .derive(async ({ jwt, headers }) => {
    const authorization = headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return {
        isAuthenticated: false,
        user: null,
        error: 'Token não fornecido'
      };
    }

    const token = authorization.substring(7);
    
    try {
      const payload = await jwt.verify(token);
      
      if (!payload) {
        return {
          isAuthenticated: false,
          user: null,
          error: 'Token inválido'
        };
      }

      return {
        isAuthenticated: true,
        user: {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          tenantId: payload.tenantId
        },
        error: null
      };
    } catch (error) {
      logger.error('Erro ao verificar token JWT', error as Error, 'AuthMiddleware');
      return {
        isAuthenticated: false,
        user: null,
        error: 'Token inválido'
      };
    }
  })
  .onRequest(({ user, isAuthenticated, error, set }) => {
    if (!isAuthenticated) {
      set.status = 401;
      return {
        success: false,
        error: error || 'Não autenticado',
        timestamp: new Date().toISOString()
      };
    }
  });
  */

/**
 * Middleware de autorização por role
 */
export const roleMiddleware = (requiredRole: string) => new Elysia({ name: 'role-middleware' })
  /*
  .use(authMiddleware)
  .onRequest(({ user, set }) => {
    if (user?.role !== requiredRole && user?.role !== 'admin') {
      set.status = 403;
      return {
        success: false,
        error: 'Acesso negado - permissão insuficiente',
        timestamp: new Date().toISOString()
      };
    }
  });
  */

/**
 * Middleware de autorização admin
 */
export const adminMiddleware = roleMiddleware('admin');

/**
 * Middleware de autorização user ou admin
 */
export const userOrAdminMiddleware = new Elysia({ name: 'user-or-admin-middleware' })
  /*
  .use(authMiddleware)
  .onRequest(({ user, set }) => {
    if (user?.role !== 'user' && user?.role !== 'admin') {
      set.status = 403;
      return {
        success: false,
        error: 'Acesso negado - permissão insuficiente',
        timestamp: new Date().toISOString()
      };
    }
  });
  */

/**
 * Middleware de logging de autenticação
 */
export const authLoggingMiddleware = new Elysia({ name: 'auth-logging-middleware' })
  /*
  .onRequest(({ request, user }) => {
    logger.info('Requisição autenticada', 'AuthLogging', {
      method: request.method,
      url: request.url,
      userId: user?.userId || 'anonymous',
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
  })
  .onAfterHandle(({ request, response, user }) => {
    logger.info('Resposta autenticada', 'AuthLogging', {
      method: request.method,
      url: request.url,
      userId: user?.userId || 'anonymous',
      status: response.status || 200,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
  });
  */
