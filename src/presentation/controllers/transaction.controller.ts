import { Elysia, t } from 'elysia';
import { DrizzleTransactionRepository } from '@/infrastructure/database/repositories/transaction.repository';
import { 
  TransactionListResponseDTO,
  TransactionResponseResponseDTO,
  TransactionAnalyticsResponseDTO,
  TransactionFiltersDTO,
  type TransactionDTO,
  type TransactionAnalyticsDTO
} from '../dto/transaction.dto';

/**
 * Controller para operações de transação
 */
export const transactionController = new Elysia({ prefix: '/api/v1/transactions', name: 'transaction-controller' })

  // GET /transactions - Listar transações
  .get('/', async ({ query, headers }) => {
    try {
      // Extrair tenantID do JWT manualmente
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          error: 'Token de autorização não fornecido',
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          timestamp: new Date().toISOString()
        };
      }

      const token = authHeader.substring(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tenantId = payload.tenantId;

      if (!tenantId) {
        return {
          success: false,
          error: 'TenantID não encontrado no token',
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          timestamp: new Date().toISOString()
        };
      }

      const transactionRepository = new DrizzleTransactionRepository();
      const page = query.page || 1;
      const limit = query.limit || 20;
      const offset = (page - 1) * limit;
      
      let transactions;
      let total;
      
      // Aplicar filtros baseados nos parâmetros - SEMPRE filtrar por tenantId
      if (query.status && query.type) {
        // Filtrar por tenant, status e tipo
        transactions = await transactionRepository.findByTenantIdAndStatus(tenantId, query.status);
        transactions = transactions.filter(t => t.type === query.type).slice(offset, offset + limit);
        total = await transactionRepository.countByTenantIdAndStatus(tenantId, query.status);
      } else if (query.status) {
        transactions = await transactionRepository.findByTenantIdAndStatus(tenantId, query.status, limit, offset);
        total = await transactionRepository.countByTenantIdAndStatus(tenantId, query.status);
      } else if (query.type) {
        transactions = await transactionRepository.findByTenantIdAndType(tenantId, query.type, limit, offset);
        total = await transactionRepository.countByTenantId(tenantId);
      } else if (query.startDate && query.endDate) {
        const startDate = new Date(query.startDate);
        const endDate = new Date(query.endDate);
        // Buscar todas as transações do tenant e filtrar por data
        transactions = await transactionRepository.findByTenantId(tenantId, 1000, 0);
        transactions = transactions.filter(t => {
          const createdAt = new Date(t.createdAt);
          return createdAt >= startDate && createdAt <= endDate;
        }).slice(offset, offset + limit);
        total = transactions.length;
      } else {
        // Buscar transações do tenant específico
        transactions = await transactionRepository.findByTenantId(tenantId, limit, offset);
        total = await transactionRepository.countByTenantId(tenantId);
      }
      
      // Converter para DTOs (dados brutos do banco)
      const transactionDTOs = transactions.map(transaction => ({
        id: transaction.id,
        paymentId: transaction.paymentId,
        tenantId: transaction.tenantId,
        type: transaction.type,
        amount: transaction.amount / 100, // Converter de centavos para reais
        status: transaction.status,
        providerTransactionId: transaction.providerTransactionId,
        providerData: transaction.providerData as Record<string, any> | null,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      }));
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        success: true,
        data: transactionDTOs,
        pagination: { page, limit, total, totalPages },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao listar transações:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        timestamp: new Date().toISOString()
      };
    }
  }, {
    query: TransactionFiltersDTO,
    response: TransactionListResponseDTO,
    detail: {
      tags: ['Transactions'],
      summary: 'Listar transações',
      description: 'Lista transações com filtros opcionais e paginação',
    }
  })

  // GET /transactions/:id - Buscar transação por ID
  .get('/:id', async ({ params, headers }) => {
    try {
      // Extrair tenantID do JWT manualmente
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          error: 'Token de autorização não fornecido',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      const token = authHeader.substring(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tenantId = payload.tenantId;

      if (!tenantId) {
        return {
          success: false,
          error: 'TenantID não encontrado no token',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      const transactionRepository = new DrizzleTransactionRepository();
      const transaction = await transactionRepository.findById(params.id);
      
      if (!transaction) {
        return {
          success: false,
          error: 'Transação não encontrada',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      // Validar se a transação pertence ao tenant
      if (transaction.tenantId !== tenantId) {
        return {
          success: false,
          error: 'Transação não pertence ao seu tenant',
          data: null,
          timestamp: new Date().toISOString()
        };
      }
      
      // Converter dados do banco para DTO
      const transactionDTO = {
        id: transaction.id,
        paymentId: transaction.paymentId,
        tenantId: transaction.tenantId,
        type: transaction.type,
        amount: transaction.amount / 100, // Converter de centavos para reais
        status: transaction.status,
        providerTransactionId: transaction.providerTransactionId,
        providerData: transaction.providerData as Record<string, any> | null,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      };
      
      return {
        success: true,
        data: transactionDTO,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    response: TransactionResponseResponseDTO,
    detail: {
      tags: ['Transactions'],
      summary: 'Buscar transação por ID',
      description: 'Retorna uma transação específica por ID',
    }
  })

  // GET /transactions/analytics - Analytics de transações
  .get('/analytics', async ({ query, headers }) => {
    try {
      // Extrair tenantID do JWT manualmente
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          error: 'Token de autorização não fornecido',
          data: {
            totalAmount: 0,
            totalCount: 0,
            successRate: 0,
            averageAmount: 0,
            byType: {},
            byStatus: {}
          },
          timestamp: new Date().toISOString()
        };
      }

      const token = authHeader.substring(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tenantId = payload.tenantId;

      if (!tenantId) {
        return {
          success: false,
          error: 'TenantID não encontrado no token',
          data: {
            totalAmount: 0,
            totalCount: 0,
            successRate: 0,
            averageAmount: 0,
            byType: {},
            byStatus: {}
          },
          timestamp: new Date().toISOString()
        };
      }

      const transactionRepository = new DrizzleTransactionRepository();
      
      // Buscar estatísticas reais do tenant específico
      const totalCount = await transactionRepository.countByTenantId(tenantId);
      const totalAmount = await transactionRepository.getTotalAmountByTenantId(tenantId);
      const capturedCount = await transactionRepository.countByTenantIdAndStatus(tenantId, 'captured');
      const authorizedCount = await transactionRepository.countByTenantIdAndStatus(tenantId, 'authorized');
      const failedCount = await transactionRepository.countByTenantIdAndStatus(tenantId, 'failed');
      
      const successRate = totalCount > 0 ? ((capturedCount + authorizedCount) / totalCount) * 100 : 0;
      const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;
      
      // Buscar transações para calcular por tipo
      const transactions = await transactionRepository.findByTenantId(tenantId, 1000, 0);
      const byType = transactions.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const byStatus = transactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const analyticsData: TransactionAnalyticsDTO = {
        totalAmount: totalAmount / 100, // Converter de centavos para reais
        totalCount,
        successRate: Math.round(successRate * 100) / 100,
        averageAmount: Math.round((averageAmount / 100) * 100) / 100,
        byType,
        byStatus,
      };
      
      return {
        success: true,
        data: analyticsData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar analytics de transações:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        data: {
          totalAmount: 0,
          totalCount: 0,
          successRate: 0,
          averageAmount: 0,
          byType: {},
          byStatus: {}
        },
        timestamp: new Date().toISOString()
      };
    }
  }, {
    response: TransactionAnalyticsResponseDTO,
    detail: {
      tags: ['Transactions'],
      summary: 'Analytics de transações',
      description: 'Retorna estatísticas e métricas das transações',
    }
  })

  // GET /transactions/payment/:paymentId - Buscar transações por pagamento
  .get('/payment/:paymentId', async ({ params, headers }) => {
    try {
      // Extrair tenantID do JWT manualmente
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          error: 'Token de autorização não fornecido',
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            totalPages: 0
          },
          timestamp: new Date().toISOString()
        };
      }

      const token = authHeader.substring(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tenantId = payload.tenantId;

      if (!tenantId) {
        return {
          success: false,
          error: 'TenantID não encontrado no token',
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            totalPages: 0
          },
          timestamp: new Date().toISOString()
        };
      }

      const transactionRepository = new DrizzleTransactionRepository();
      const transactions = await transactionRepository.findByPaymentId(params.paymentId);
      
      // Filtrar apenas transações do tenant
      const tenantTransactions = transactions.filter(t => t.tenantId === tenantId);
      
      // Converter para DTOs
      const transactionDTOs = tenantTransactions.map(transaction => ({
        id: transaction.id,
        paymentId: transaction.paymentId,
        tenantId: transaction.tenantId,
        type: transaction.type,
        amount: transaction.amount / 100, // Converter de centavos para reais
        status: transaction.status,
        providerTransactionId: transaction.providerTransactionId,
        providerData: transaction.providerData as Record<string, any> | null,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      }));
      
      return {
        success: true,
        data: transactionDTOs,
        pagination: {
          page: 1,
          limit: transactionDTOs.length,
          total: transactionDTOs.length,
          totalPages: 1
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar transações por pagamento:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        data: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0
        },
        timestamp: new Date().toISOString()
      };
    }
  }, {
    params: t.Object({
      paymentId: t.String()
    }),
    response: TransactionListResponseDTO,
    detail: {
      tags: ['Transactions'],
      summary: 'Buscar transações por pagamento',
      description: 'Retorna todas as transações de um pagamento específico',
    }
  });
