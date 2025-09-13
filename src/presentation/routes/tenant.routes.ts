import { Elysia } from 'elysia';
import { tenantController } from '../controllers/tenant.controller';
// import { tenantControllerSimple } from '../controllers/tenant.controller.simple';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { simpleLoggingMiddleware, simpleCorsMiddleware, simpleValidationMiddleware } from '../middleware/simple.middleware';

/**
 * Rotas de tenant
 */
export const tenantRoutes = new Elysia({ prefix: '/api/v1', name: 'tenant-routes' })
  .use(simpleLoggingMiddleware)
  .use(simpleCorsMiddleware)
  .use(simpleValidationMiddleware)
  .use(authMiddleware)
  .use(adminMiddleware)
  .use(tenantMiddleware)
  .use(tenantController);