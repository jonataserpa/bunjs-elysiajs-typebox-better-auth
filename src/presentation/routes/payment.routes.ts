import { Elysia } from 'elysia';
import { paymentController } from '../controllers/payment.controller';
import { authMiddleware, userOrAdminMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { simpleLoggingMiddleware, simpleCorsMiddleware, simpleValidationMiddleware } from '../middleware/simple.middleware';

/**
 * Rotas de pagamento
 */
export const paymentRoutes = new Elysia({ prefix: '/api/v1', name: 'payment-routes' })
  .use(simpleLoggingMiddleware)
  .use(simpleCorsMiddleware)
  .use(simpleValidationMiddleware)
  .use(authMiddleware)
  .use(userOrAdminMiddleware)
  .use(tenantMiddleware)
  .use(paymentController);
