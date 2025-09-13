import { Elysia } from 'elysia';
import { paymentControllerSimple } from '../controllers/payment.controller.simple';

/**
 * Rotas de pagamento
 */
export const paymentRoutes = new Elysia({ prefix: '/api/v1', name: 'payment-routes' })
  .use(paymentControllerSimple);
