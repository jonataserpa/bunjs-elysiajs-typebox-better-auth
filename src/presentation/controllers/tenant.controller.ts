import { Elysia, t } from 'elysia';
import { logger } from '@/infrastructure/logging/Logger';
import { TenantApplicationService } from '@/application/services/TenantApplicationService';
import type { PaymentRepository } from '@/application/interfaces/repositories/PaymentRepository';
import { DrizzleTenantRepository } from '@/infrastructure/database/repositories/tenant.repository';
import { DrizzleUserRepository } from '@/infrastructure/database/repositories/user.repository';
import { DrizzlePaymentRepository } from '@/infrastructure/database/repositories/payment.repository';
import { CreateTenantDTO, UpdateTenantDTO, TenantResponseDTO, TenantListDTO } from '../dto/tenant.dto';
import { SuccessResponseDTO, ErrorResponseDTO, CreatedResponseDTO, PaginatedResponseDTO } from '../dto/common.dto';

// Adapters simples para repositories
class TenantRepositoryAdapter {
  constructor(private drizzleRepo: DrizzleTenantRepository) {}

  async save(tenant: any): Promise<void> { throw new Error('Method not implemented.'); }
  async findById(id: string): Promise<any> { return this.drizzleRepo.findById(id); }
  async findBySlug(slug: string): Promise<any> { return this.drizzleRepo.findBySlug(slug); }
  async findByEmail(email: string): Promise<any> { return this.drizzleRepo.findByEmail(email); }
  async findAll(): Promise<any[]> { return this.drizzleRepo.findAll(); }
  async findWithFilters(filters: any): Promise<any[]> {
    if (filters.status) return this.drizzleRepo.findByStatus(filters.status);
    return this.drizzleRepo.findAll(filters.limit, filters.offset);
  }
  async count(): Promise<number> { return this.drizzleRepo.count(); }
  async countWithFilters(filters: any): Promise<number> {
    if (filters.status) return this.drizzleRepo.countByStatus(filters.status);
    return this.drizzleRepo.count();
  }
  async existsBySlug(slug: string): Promise<boolean> { return this.drizzleRepo.slugExists(slug); }
  async existsByEmail(email: string): Promise<boolean> { return this.drizzleRepo.emailExists(email); }
  async delete(id: string): Promise<void> { await this.drizzleRepo.delete(id); }
  async restore(id: string): Promise<void> { throw new Error('Method not implemented.'); }
}

class UserRepositoryAdapter {
  constructor(private drizzleRepo: DrizzleUserRepository) {}

  async save(user: any): Promise<void> { throw new Error('Method not implemented.'); }
  async findById(id: string): Promise<any> { return this.drizzleRepo.findById(id); }
  async findByEmail(email: string): Promise<any> { throw new Error('Method not implemented.'); }
  async findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<any[]> { 
    return this.drizzleRepo.findByTenantId(tenantId, limit, offset); 
  }
  async findAll(): Promise<any[]> { throw new Error('Method not implemented.'); }
  async findWithFilters(filters: any): Promise<any[]> { throw new Error('Method not implemented.'); }
  async count(): Promise<number> { throw new Error('Method not implemented.'); }
  async countWithFilters(filters: any): Promise<number> { throw new Error('Method not implemented.'); }
  async existsByEmail(email: string): Promise<boolean> { throw new Error('Method not implemented.'); }
  async existsByEmailInTenant(email: string, tenantId: string): Promise<boolean> { 
    return this.drizzleRepo.emailExistsInTenant(email, tenantId); 
  }
  async delete(id: string): Promise<void> { await this.drizzleRepo.delete(id); }
  async restore(id: string): Promise<void> { throw new Error('Method not implemented.'); }
}

class PaymentRepositoryAdapter {
  constructor(private drizzleRepo: DrizzlePaymentRepository) {}

  async save(payment: any): Promise<void> { throw new Error('Method not implemented.'); }
  async findById(id: string): Promise<any> { return this.drizzleRepo.findById(id); }
  async findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<any[]> { 
    return this.drizzleRepo.findByTenantId(tenantId, limit, offset); 
  }
  async findAll(): Promise<any[]> { throw new Error('Method not implemented.'); }
  async findWithFilters(filters: any): Promise<any[]> { throw new Error('Method not implemented.'); }
  async count(): Promise<number> { throw new Error('Method not implemented.'); }
  async countWithFilters(filters: any): Promise<number> { throw new Error('Method not implemented.'); }
  async delete(id: string): Promise<void> { await this.drizzleRepo.delete(id); }
  async restore(id: string): Promise<void> { throw new Error('Method not implemented.'); }
}

// Inicializar serviços
const drizzleTenantRepository = new DrizzleTenantRepository();
const drizzleUserRepository = new DrizzleUserRepository();
const drizzlePaymentRepository = new DrizzlePaymentRepository();
const tenantRepository = new TenantRepositoryAdapter(drizzleTenantRepository);
const userRepository = new UserRepositoryAdapter(drizzleUserRepository);
const paymentRepository = new PaymentRepositoryAdapter(drizzlePaymentRepository);
const tenantService = new TenantApplicationService(
  tenantRepository as any,
  userRepository as any,
  paymentRepository as any
);

/**
 * Controller para operações de tenant
 */
export const tenantController = new Elysia({ prefix: '/api/v1/tenants', name: 'tenant-controller' })
  // Temporariamente comentado para corrigir erros de tipagem
  /*

  // GET /tenants - Listar tenants
  .get('/', async ({ query }) => {
    try {
      const result = await tenantService.listTenants(query);

      if (!result.success) {
        return {
          success: false,
          error: result.errors?.getAllErrors().map(e => e.message).join(', ') || 'Erro ao listar tenants',
          details: result.errors?.getAllErrors().map(e => e.message),
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao listar tenants', error as Error, 'TenantController');
      throw error;
    }
  }, {
    query: t.Object({
      page: t.Optional(t.Number({ minimum: 1, default: 1 })),
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
      sort: t.Optional(t.String()),
      order: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
      status: t.Optional(t.Enum(TenantStatus)),
      search: t.Optional(t.String())
    }),
    response: PaginatedResponseDTO(TenantListDTO)
  })

  // GET /tenants/:id - Obter tenant por ID
  .get('/:id', async ({ params }) => {
    try {
      const result = await tenantService.getTenantById(params.id);

      if (!result.success) {
        return {
          success: false,
          error: result.errors?.getAllErrors().map(e => e.message).join(', ') || 'Erro ao obter tenant',
          details: result.errors?.getAllErrors().map(e => e.message),
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao obter tenant', error as Error, 'TenantController', { tenantId: params.id });
      throw error;
    }
  }, {
    params: t.Object({ id: t.String() }),
    response: SuccessResponseDTO
  })

  // GET /tenants/slug/:slug - Obter tenant por slug
  .get('/slug/:slug', async ({ params }) => {
    try {
      const tenant = await tenantService.getTenantBySlug(params.slug);

      if (!tenant) {
        return {
          success: false,
          error: 'Tenant não encontrado',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: tenant,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao obter tenant por slug', error as Error, 'TenantController', { slug: params.slug });
      throw error;
    }
  }, {
    params: t.Object({ slug: t.String() }),
    response: SuccessResponseDTO
  })

  // POST /tenants - Criar tenant
  .post('/', async ({ body, user }) => {
    try {
      const result = await tenantService.createTenant(body, user.id);

      if (!result.success) {
        return {
          success: false,
          error: result.errors?.getAllErrors().map(e => e.message).join(', ') || 'Erro ao criar tenant',
          details: result.errors?.getAllErrors().map(e => e.message),
          timestamp: new Date().toISOString()
        };
      }

      logger.info('Tenant criado com sucesso', 'TenantController', {
        tenantId: result.data?.id,
        slug: result.data?.slug,
        userId: user.id
      });

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao criar tenant', error as Error, 'TenantController');
      throw error;
    }
  }, {
    body: CreateTenantDTO,
    response: CreatedResponseDTO(TenantResponseDTO)
  })

  // PUT /tenants/:id - Atualizar tenant
  .put('/:id', async ({ params, body }) => {
    try {
      const result = await tenantService.updateTenant(params.id, body);

      if (!result.success) {
        return {
          success: false,
          error: result.errors?.getAllErrors().map(e => e.message).join(', ') || 'Erro ao atualizar tenant',
          details: result.errors?.getAllErrors().map(e => e.message),
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao atualizar tenant', error as Error, 'TenantController', { tenantId: params.id });
      throw error;
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: UpdateTenantDTO,
    response: SuccessResponseDTO
  })

  // POST /tenants/:id/operation - Operação no tenant
  .post('/:id/operation', async ({ params, body }) => {
    try {
      const result = await tenantService.performTenantOperation(params.id, body);

      if (!result.success) {
        return {
          success: false,
          error: result.errors?.getAllErrors().map(e => e.message).join(', ') || 'Erro na operação do tenant',
          details: result.errors?.getAllErrors().map(e => e.message),
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro na operação do tenant', error as Error, 'TenantController', { tenantId: params.id });
      throw error;
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      operation: t.Union([
        t.Literal('activate'),
        t.Literal('deactivate'),
        t.Literal('suspend'),
        t.Literal('resume')
      ]),
      reason: t.Optional(t.String())
    })
  })

  // GET /tenants/:id/stats - Estatísticas do tenant
  .get('/:id/stats', async ({ params, query }) => {
    try {
      const stats = await tenantService.getTenantStats(params.id, query);

      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas do tenant', error as Error, 'TenantController', { tenantId: params.id });
      throw error;
    }
  }, {
    params: t.Object({ id: t.String() }),
    query: t.Object({
      period: t.Optional(t.Union([
        t.Literal('day'),
        t.Literal('week'),
        t.Literal('month'),
        t.Literal('year')
      ])),
      startDate: t.Optional(t.String({ format: 'date' })),
      endDate: t.Optional(t.String({ format: 'date' }))
    })
  })

  // POST /tenants/slug/validate - Validar slug do tenant
  .post('/slug/validate', async ({ body }) => {
    try {
      const result = await tenantService.validateTenantSlug(body);

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao validar slug', error as Error, 'TenantController');
      throw error;
    }
  }, {
    body: t.Object({
      slug: t.String({ minLength: 3, maxLength: 50 })
    })
  })

  // POST /tenants/:id/webhook/config - Configurar webhook
  .post('/:id/webhook/config', async ({ params, body }) => {
    try {
      const result = await tenantService.configureWebhook(params.id, body);

      if (!result.success) {
        return {
          success: false,
          error: result.errors?.getAllErrors().map(e => e.message).join(', ') || 'Erro ao configurar webhook',
          details: result.errors?.getAllErrors().map(e => e.message),
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao configurar webhook', error as Error, 'TenantController', { tenantId: params.id });
      throw error;
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      url: t.String({ format: 'uri' }),
      events: t.Array(t.String()),
      secret: t.Optional(t.String()),
      timeout: t.Optional(t.Number({ minimum: 1000, maximum: 30000 })),
      retries: t.Optional(t.Number({ minimum: 0, maximum: 5 }))
    })
  })

  // POST /tenants/:id/webhook/test - Testar webhook
  .post('/:id/webhook/test', async ({ params, body }) => {
    try {
      const result = await tenantService.testWebhook(params.id, body);

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao testar webhook', error as Error, 'TenantController', { tenantId: params.id });
      throw error;
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      event: t.String(),
      payload: t.Optional(t.Record(t.String(), t.Any()))
    })
  })

  // POST /tenants/:id/api-keys - Configurar API keys
  .post('/:id/api-keys', async ({ params, body }) => {
    try {
      const result = await tenantService.configureApiKeys(params.id, body);

      if (!result.success) {
        return {
          success: false,
          error: result.errors?.getAllErrors().map(e => e.message).join(', ') || 'Erro ao configurar API keys',
          details: result.errors?.getAllErrors().map(e => e.message),
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao configurar API keys', error as Error, 'TenantController', { tenantId: params.id });
      throw error;
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      stripe: t.Optional(t.Object({
        secretKey: t.String(),
        publishableKey: t.String(),
        webhookSecret: t.Optional(t.String())
      })),
      pagarme: t.Optional(t.Object({
        apiKey: t.String(),
        webhookSecret: t.Optional(t.String())
      }))
    })
  })

  // GET /tenants/:id/api-keys - Obter configuração de API keys
  .get('/:id/api-keys', async ({ params, tenantService }) => {
    try {
      const apiKeys = await tenantService.getApiKeysConfig(params.id);

      return {
        success: true,
        data: apiKeys,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao obter API keys', error as Error, 'TenantController', { tenantId: params.id });
      throw error;
    }
  }, {
    params: t.Object({ id: t.String() })
  })

  // DELETE /tenants/:id - Deletar tenant
  .delete('/:id', async ({ params, tenantService }) => {
    try {
      const result = await tenantService.deleteTenant(params.id);

      if (!result.success) {
        return {
          success: false,
          error: result.errors?.getAllErrors().map(e => e.message).join(', ') || 'Erro ao deletar tenant',
          details: result.errors?.getAllErrors().map(e => e.message),
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Tenant deletado com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao deletar tenant', error as Error, 'TenantController', { tenantId: params.id });
      throw error;
    }
  }, {
    params: t.Object({ id: t.String() })
  });
  */
