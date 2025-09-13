import { Elysia } from 'elysia';
import { transactionController } from '../controllers/transaction.controller';

/**
 * Rotas para operações de transações
 */
export const transactionRoutes = new Elysia()
  .use(transactionController);
