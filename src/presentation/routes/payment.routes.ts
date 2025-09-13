import { Elysia } from 'elysia';
import { paymentController } from '../controllers/payment.controller';

/**
 * Rotas de pagamento
 */
export const paymentRoutes = new Elysia({ prefix: '/api/v1', name: 'payment-routes' })
  .use(paymentController);
