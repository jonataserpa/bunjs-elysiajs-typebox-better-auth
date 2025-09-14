import { Elysia, t } from 'elysia';
import { PaymentStatus } from '../../domain/enums/PaymentStatus';
import { PaymentProvider } from '../../domain/enums/PaymentProvider';
import { DrizzlePaymentRepository } from '../../infrastructure/database/repositories/payment.repository';
import { 
  PaymentListResponseDTO,
  PaymentResponseResponseDTO,
  PaymentAnalyticsResponseDTO,
  PaymentFiltersDTO,
  type PaymentDTO,
  type PaymentAnalyticsDTO
} from '../dto/payment.dto';
import { TracingUtil } from '../../shared/utils/tracing.util';

/**
 * Controller para operações de pagamento
 */
export const paymentController = new Elysia({ prefix: '/api/v1/payments', name: 'payment-controller' })

  // GET /payments - Listar pagamentos
  .get('/', async ({ query, headers }) => {
    const span = TracingUtil.createHttpSpan(
      'GET /api/v1/payments',
      'GET',
      '/api/v1/payments',
      {
        'payment.page': query.page || 1,
        'payment.limit': query.limit || 20,
        'payment.status': query.status || 'all',
        'payment.provider': query.provider || 'all'
      }
    );

    try {
      span.addEvent('payment.list.started', {
        page: query.page || 1,
        limit: query.limit || 20,
        hasStatusFilter: !!query.status,
        hasProviderFilter: !!query.provider
      });

      // Extrair tenantID do JWT manualmente
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        span.setStatus(401, new Error('Token de autorização não fornecido'));
        span.end();
        
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
        span.setStatus(401, new Error('TenantID não encontrado no token'));
        span.end();
        
        return {
          success: false,
          error: 'TenantID não encontrado no token',
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          timestamp: new Date().toISOString()
        };
      }

      span.addEvent('payment.tenant.validated', {
        tenantId: tenantId
      });

      const dbSpan = TracingUtil.createDbSpan('SELECT', 'payments', {
        'db.tenant_id': tenantId
      });

      const paymentRepository = new DrizzlePaymentRepository();
      const page = query.page || 1;
      const limit = query.limit || 20;
      const offset = (page - 1) * limit;
      
      let payments;
      let total;
      
      // Aplicar filtros baseados nos parâmetros - SEMPRE filtrar por tenantId
      if (query.status && query.provider) {
        // Filtrar por tenant, status e provider
        payments = await paymentRepository.findByTenantIdAndStatus(tenantId, query.status);
        payments = payments.filter(p => p.provider === query.provider).slice(offset, offset + limit);
        total = await paymentRepository.countByTenantIdAndStatus(tenantId, query.status);
        dbSpan.addEvent('db.filter.applied', { filter: 'status_and_provider' });
      } else if (query.status) {
        payments = await paymentRepository.findByTenantIdAndStatus(tenantId, query.status, limit, offset);
        total = await paymentRepository.countByTenantIdAndStatus(tenantId, query.status);
        dbSpan.addEvent('db.filter.applied', { filter: 'status' });
      } else if (query.provider) {
        payments = await paymentRepository.findByTenantIdAndProvider(tenantId, query.provider, limit, offset);
        total = await paymentRepository.countByTenantId(tenantId);
        dbSpan.addEvent('db.filter.applied', { filter: 'provider' });
      } else if (query.startDate && query.endDate) {
        const startDate = new Date(query.startDate);
        const endDate = new Date(query.endDate);
        payments = await paymentRepository.findByDateRange(startDate, endDate, tenantId);
        total = payments.length;
        dbSpan.addEvent('db.filter.applied', { filter: 'date_range' });
      } else {
        // Buscar pagamentos do tenant específico
        payments = await paymentRepository.findByTenantId(tenantId, limit, offset);
        total = await paymentRepository.countByTenantId(tenantId);
        dbSpan.addEvent('db.filter.applied', { filter: 'tenant_only' });
      }
      
      dbSpan.setStatus(true);
      dbSpan.end();

      span.addEvent('payment.list.db_query_completed', {
        paymentsFound: payments.length,
        totalCount: total
      });
      
      // Converter para DTOs (dados brutos do banco)
      const paymentDTOs = payments.map(payment => ({
        id: payment.id,
        tenantId: payment.tenantId,
        userId: payment.userId || undefined,
        amount: payment.amount / 100, // Converter de centavos para reais
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        providerPaymentId: payment.providerPaymentId,
        providerData: payment.providerData,
        description: payment.description || 'Sem descrição',
        metadata: payment.metadata,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
        expiresAt: payment.expiresAt?.toISOString() || undefined,
        paidAt: payment.paidAt?.toISOString() || undefined
      }));
      
      const totalPages = Math.ceil(total / limit);
      
      span.addEvent('payment.list.response_ready', {
        paymentsReturned: paymentDTOs.length,
        totalPages: totalPages
      });

      span.setStatus(200);
      span.end();
      
      return {
        success: true,
        data: paymentDTOs,
        pagination: { page, limit, total, totalPages },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      dbSpan.setStatus(false, error as Error);
      dbSpan.end();
      span.setStatus(500, error as Error);
      span.end();
      
      console.error('Erro ao listar pagamentos:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        timestamp: new Date().toISOString()
      };
    }
  }, {
    query: PaymentFiltersDTO,
    // response: PaymentListResponseDTO, // Removido temporariamente para evitar conflitos de tipo
    detail: {
      tags: ['Payments'],
      summary: 'Listar pagamentos',
      description: 'Lista pagamentos com filtros opcionais e paginação',
    }
  })

  // GET /payments/:id - Buscar pagamento por ID
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

      const paymentRepository = new DrizzlePaymentRepository();
      const payment = await paymentRepository.findById(params.id);
      
      if (!payment) {
        return {
          success: false,
          error: 'Pagamento não encontrado',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      // Validar se o pagamento pertence ao tenant
      if (payment.tenantId !== tenantId) {
        return {
          success: false,
          error: 'Pagamento não pertence ao seu tenant',
          data: null,
          timestamp: new Date().toISOString()
        };
      }
      
      // Converter dados do banco para DTO
      const paymentDTO = {
        id: payment.id,
        tenantId: payment.tenantId,
        userId: payment.userId || undefined,
        amount: payment.amount / 100, // Converter de centavos para reais
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        providerPaymentId: payment.providerPaymentId,
        providerData: payment.providerData,
        description: payment.description || 'Sem descrição',
        metadata: payment.metadata,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
        expiresAt: payment.expiresAt?.toISOString() || undefined,
        paidAt: payment.paidAt?.toISOString() || undefined
      };
      
      return {
        success: true,
        data: paymentDTO,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
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
    // response: PaymentResponseResponseDTO, // Removido temporariamente para evitar conflitos de tipo
    detail: {
      tags: ['Payments'],
      summary: 'Buscar pagamento por ID',
      description: 'Retorna um pagamento específico por ID',
    }
  })

  // GET /payments/analytics - Analytics de pagamentos
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
            byProvider: {},
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
            byProvider: {},
            byStatus: {}
          },
          timestamp: new Date().toISOString()
        };
      }

      const paymentRepository = new DrizzlePaymentRepository();
      
      // Buscar estatísticas reais do tenant específico
      const totalCount = await paymentRepository.countByTenantId(tenantId);
      const totalAmount = await paymentRepository.getTotalAmountByTenantId(tenantId);
      const capturedCount = await paymentRepository.countByTenantIdAndStatus(tenantId, 'captured');
      const failedCount = await paymentRepository.countByTenantIdAndStatus(tenantId, 'failed');
      
      const successRate = totalCount > 0 ? (capturedCount / totalCount) * 100 : 0;
      const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;
      
      // Buscar pagamentos para calcular por provider
      const payments = await paymentRepository.findByTenantId(tenantId, 1000, 0);
      const byProvider = payments.reduce((acc, p) => {
        acc[p.provider] = (acc[p.provider] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const byStatus = payments.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const analyticsData: PaymentAnalyticsDTO = {
        totalAmount: totalAmount / 100, // Converter de centavos para reais
        totalCount,
        successRate: Math.round(successRate * 100) / 100,
        averageAmount: Math.round((averageAmount / 100) * 100) / 100,
        byProvider,
        byStatus,
      };
      
      return {
        success: true,
        data: analyticsData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar analytics de pagamentos:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        data: {
          totalAmount: 0,
          totalCount: 0,
          successRate: 0,
          averageAmount: 0,
          byProvider: {},
          byStatus: {}
        },
        timestamp: new Date().toISOString()
      };
    }
  }, {
    // response: PaymentAnalyticsResponseDTO, // Removido temporariamente para evitar conflitos de tipo
    detail: {
      tags: ['Payments'],
      summary: 'Analytics de pagamentos',
      description: 'Retorna estatísticas e métricas dos pagamentos',
    }
  });