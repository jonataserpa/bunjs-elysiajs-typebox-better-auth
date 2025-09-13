import { Elysia } from 'elysia';
import { tenantController } from '../controllers/tenant.controller';

/**
 * Rotas de tenant
 */
export const tenantRoutes = new Elysia({ name: 'tenant-routes' })
  .use(tenantController);