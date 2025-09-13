import { Elysia } from 'elysia';
import { tenantControllerSimple } from '../controllers/tenant.controller.simple';

/**
 * Rotas de tenant
 */
export const tenantRoutes = new Elysia({ prefix: '/api/v1', name: 'tenant-routes' })
  .use(tenantControllerSimple);