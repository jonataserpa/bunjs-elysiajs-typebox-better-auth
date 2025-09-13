import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { appConfig } from '@/shared/config/app.config';

/**
 * Middleware para extrair tenantID do JWT
 */
export const tenantJwtMiddleware = new Elysia({ name: 'tenant-jwt-middleware' })
  .use(jwt({
    name: 'jwt',
    secret: appConfig.auth.jwtSecret,
  }))
  .derive(async ({ headers, jwt }) => {
    try {
      // Extrair token do header Authorization
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token de autorização não fornecido');
      }

      const token = authHeader.substring(7); // Remove 'Bearer '
      
      // Decodificar JWT
      const payload = await jwt.verify(token);
      if (!payload) {
        throw new Error('Token inválido');
      }

      // Extrair tenantID do payload
      const tenantId = payload.tenantId;
      if (!tenantId) {
        throw new Error('TenantID não encontrado no token');
      }

      return {
        tenantId,
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role
        }
      };
    } catch (error) {
      throw new Error(`Erro de autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });
