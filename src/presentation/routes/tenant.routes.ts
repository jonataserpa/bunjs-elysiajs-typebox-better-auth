import { Elysia } from 'elysia';
import { tenantController } from '../controllers/tenant.controller';

/**
 * Rotas de tenant
 */
export const tenantRoutes = new Elysia({ prefix: '/api/v1', name: 'tenant-routes' })
  .use(tenantController);