import { Elysia, t } from 'elysia';
import { PaymentStatus } from '@/domain/enums/PaymentStatus';
import { PaymentProvider } from '@/domain/enums/PaymentProvider';
import { DrizzlePaymentRepository } from '@/infrastructure/database/repositories/payment.repository';
import { PaymentMapper } from '@/application/mappers/PaymentMapper';
import { tenantJwtMiddleware } from '../middleware/tenant-jwt.middleware';

/**
 * Controller simplificado para operações de pagamento (apenas para documentação Swagger)
 */
export const paymentControllerSimple = new Elysia({ prefix: '/payments', name: 'payment-controller-simple' })
  // .use(tenantJwtMiddleware) // Temporariamente desabilitado

  // GET /payments - Listar pagamentos
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
      // Decodificar JWT (simples, sem validação de assinatura por agora)
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
      } else if (query.status) {
        payments = await paymentRepository.findByTenantIdAndStatus(tenantId, query.status, limit, offset);
        total = await paymentRepository.countByTenantIdAndStatus(tenantId, query.status);
      } else if (query.provider) {
        payments = await paymentRepository.findByTenantIdAndProvider(tenantId, query.provider, limit, offset);
        total = await paymentRepository.countByTenantId(tenantId);
      } else if (query.startDate && query.endDate) {
        const startDate = new Date(query.startDate);
        const endDate = new Date(query.endDate);
        payments = await paymentRepository.findByDateRange(startDate, endDate, tenantId);
        total = payments.length;
      } else {
        // Buscar pagamentos do tenant específico
        payments = await paymentRepository.findByTenantId(tenantId, limit, offset);
        total = await paymentRepository.countByTenantId(tenantId);
      }
      
      // Converter para DTOs (dados brutos do banco)
      const paymentDTOs = payments.map(payment => ({
        id: payment.id,
        tenantId: payment.tenantId,
        userId: payment.userId,
        amount: payment.amount / 100, // Converter de centavos para reais
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        providerPaymentId: payment.providerPaymentId,
        providerData: payment.providerData,
        description: payment.description,
        metadata: payment.metadata,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        expiresAt: payment.expiresAt,
        paidAt: payment.paidAt
      }));
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        success: true,
        data: paymentDTOs,
        pagination: {
          page,
          limit,
          total,
          totalPages
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        },
        timestamp: new Date().toISOString()
      };
    }
  }, {
    query: t.Object({
      page: t.Optional(t.Number()),
      limit: t.Optional(t.Number()),
      status: t.Optional(t.Enum(PaymentStatus)),
      provider: t.Optional(t.Enum(PaymentProvider)),
      startDate: t.Optional(t.String()),
      endDate: t.Optional(t.String())
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Array(t.Any()),
      pagination: t.Object({
        page: t.Number(),
        limit: t.Number(),
        total: t.Number(),
        totalPages: t.Number()
      }),
      timestamp: t.String()
    }),
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
        userId: payment.userId,
        amount: payment.amount / 100, // Converter de centavos para reais
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        providerPaymentId: payment.providerPaymentId,
        providerData: payment.providerData,
        description: payment.description,
        metadata: payment.metadata,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        expiresAt: payment.expiresAt,
        paidAt: payment.paidAt
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
    params: t.Object({ id: t.String() }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Any(),
      timestamp: t.String()
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Buscar pagamento por ID',
      description: 'Retorna os detalhes de um pagamento específico',
    }
  })

  // POST /payments - Criar pagamento
  .post('/', ({ body }) => ({
    success: true,
    data: {
      id: 'payment-123',
      status: PaymentStatus.PENDING,
      amount: body.amount,
      currency: body.currency,
      provider: body.provider,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  }), {
    body: t.Object({
      amount: t.Number(),
      currency: t.String(),
      provider: t.Enum(PaymentProvider),
      description: t.String(),
      customerInfo: t.Optional(t.Object({
        name: t.String(),
        email: t.String(),
        document: t.Optional(t.String()),
        phone: t.Optional(t.String())
      })),
      metadata: t.Optional(t.Object({})),
      expiresAt: t.Optional(t.String()),
      userId: t.Optional(t.String())
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Any(),
      timestamp: t.String()
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Criar pagamento',
      description: 'Cria um novo pagamento com os dados fornecidos',
    }
  })

  // PUT /payments/:id - Atualizar pagamento
  .put('/:id', ({ params, body }) => ({
    success: true,
    data: {
      id: params.id,
      status: PaymentStatus.PENDING,
      amount: 100.00,
      currency: 'BRL',
      provider: PaymentProvider.STRIPE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  }), {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      description: t.Optional(t.String()),
      metadata: t.Optional(t.Object({})),
      expiresAt: t.Optional(t.String())
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Any(),
      timestamp: t.String()
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Atualizar pagamento',
      description: 'Atualiza os dados de um pagamento existente',
    }
  })

  // POST /payments/:id/capture - Capturar pagamento
  .post('/:id/capture', ({ params, body }) => ({
    success: true,
    data: {
      id: params.id,
      status: PaymentStatus.CAPTURED,
      amount: 100.00,
      currency: 'BRL',
      provider: PaymentProvider.STRIPE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  }), {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      amount: t.Optional(t.Number()),
      reason: t.Optional(t.String())
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Any(),
      timestamp: t.String()
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Capturar pagamento',
      description: 'Captura um pagamento autorizado',
    }
  })

  // POST /payments/:id/cancel - Cancelar pagamento
  .post('/:id/cancel', ({ params, body }) => ({
    success: true,
    data: {
      id: params.id,
      status: PaymentStatus.CANCELLED,
      amount: 100.00,
      currency: 'BRL',
      provider: PaymentProvider.STRIPE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  }), {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      metadata: t.Optional(t.Object({})),
      reason: t.Optional(t.String())
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Any(),
      timestamp: t.String()
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Cancelar pagamento',
      description: 'Cancela um pagamento pendente ou autorizado',
    }
  })

  // POST /payments/:id/refund - Reembolsar pagamento
  .post('/:id/refund', ({ params, body }) => ({
    success: true,
    data: {
      id: params.id,
      status: PaymentStatus.REFUNDED,
      amount: 100.00,
      currency: 'BRL',
      provider: PaymentProvider.STRIPE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  }), {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      amount: t.Optional(t.Number()),
      metadata: t.Optional(t.Object({})),
      reason: t.Optional(t.String())
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Any(),
      timestamp: t.String()
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Reembolsar pagamento',
      description: 'Reembolsa um pagamento capturado (parcial ou total)',
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
      
      // Buscar estatísticas reais do tenant específico
      const totalCount = await paymentRepository.countByTenantId(tenantId);
      const totalAmount = await paymentRepository.getTotalAmountByTenantId(tenantId);
      const capturedCount = await paymentRepository.countByTenantIdAndStatus(tenantId, 'captured');
      const failedCount = await paymentRepository.countByTenantIdAndStatus(tenantId, 'failed');
      
      const successRate = totalCount > 0 ? (capturedCount / totalCount) * 100 : 0;
      const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;
      
      return {
        success: true,
        data: {
          totalAmount: totalAmount / 100, // Converter de centavos para reais
          totalCount,
          successRate: Math.round(successRate * 100) / 100,
          averageAmount: Math.round((averageAmount / 100) * 100) / 100,
          capturedCount,
          failedCount,
          pendingCount: totalCount - capturedCount - failedCount
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }, {
    query: t.Object({
      status: t.Optional(t.Enum(PaymentStatus)),
      provider: t.Optional(t.Enum(PaymentProvider)),
      startDate: t.Optional(t.String()),
      endDate: t.Optional(t.String()),
      groupBy: t.Optional(t.Union([
        t.Literal('day'),
        t.Literal('week'),
        t.Literal('month'),
        t.Literal('year')
      ]))
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Any(),
      timestamp: t.String()
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Analytics de pagamentos',
      description: 'Retorna estatísticas e métricas de pagamentos',
    }
  })

  // POST /payments/batch - Operações em lote
  .post('/batch', ({ body }) => ({
    success: true,
    data: {
      processed: 5,
      failed: 0,
      results: []
    },
    timestamp: new Date().toISOString()
  }), {
    body: t.Object({
      operation: t.Union([
        t.Literal('refund'),
        t.Literal('capture'),
        t.Literal('cancel')
      ]),
      paymentIds: t.Array(t.String()),
      metadata: t.Optional(t.Object({})),
      reason: t.Optional(t.String())
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Any(),
      timestamp: t.String()
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Operações em lote',
      description: 'Executa operações em múltiplos pagamentos',
    }
  })

  // POST /payments/webhooks/:provider - Webhook de provider
  .post('/webhooks/:provider', ({ params, body }) => ({
    success: true,
    message: 'Webhook processado com sucesso',
    timestamp: new Date().toISOString()
  }), {
    params: t.Object({ provider: t.String() }),
    body: t.Any(),
    response: t.Object({
      success: t.Boolean(),
      message: t.String(),
      timestamp: t.String()
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Webhook de provider',
      description: 'Endpoint para receber webhooks dos providers de pagamento',
    }
  })

  // DELETE /payments/:id - Deletar pagamento
  .delete('/:id', ({ params }) => ({
    success: true,
    message: 'Pagamento deletado com sucesso',
    timestamp: new Date().toISOString()
  }), {
    params: t.Object({ id: t.String() }),
    response: t.Object({
      success: t.Boolean(),
      message: t.String(),
      timestamp: t.String()
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Deletar pagamento',
      description: 'Remove um pagamento do sistema (soft delete)',
    }
  });
