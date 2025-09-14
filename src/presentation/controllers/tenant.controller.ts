import { Elysia, t } from 'elysia';
import { DrizzleTenantRepository } from '../../infrastructure/database/repositories/tenant.repository';

/**
 * Controller para operações de tenant
 */
export const tenantController = new Elysia({ prefix: '/api/v1/tenants', name: 'tenant-controller' })

  // GET /tenants - Listar tenants
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

      const tenantRepository = new DrizzleTenantRepository();
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;
      const offset = (page - 1) * limit;
      
      let tenants;
      let total;
      
      // Aplicar filtros baseados nos parâmetros
      if (query.status) {
        tenants = await tenantRepository.findByStatus(query.status, limit, offset);
        total = await tenantRepository.countByStatus(query.status);
      } else {
        // Buscar todos os tenants
        tenants = await tenantRepository.findAll(limit, offset);
        total = await tenantRepository.count();
      }
      
      // Converter para DTOs (dados brutos do banco)
      const tenantDTOs = tenants.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        email: tenant.email,
        status: tenant.status,
        settings: tenant.settings,
        isActive: tenant.status === 'active',
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString()
      }));
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        success: true,
        data: tenantDTOs,
        pagination: { page, limit, total, totalPages },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao listar tenants:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        timestamp: new Date().toISOString()
      };
    }
  }, {
    detail: {
      tags: ['Tenants'],
      summary: 'Listar tenants',
      description: 'Lista tenants com filtros opcionais e paginação',
    }
  })

  // GET /tenants/:id - Buscar tenant por ID
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

      const tenantRepository = new DrizzleTenantRepository();
      const tenant = await tenantRepository.findById(params.id);
      
      if (!tenant) {
        return {
          success: false,
          error: 'Tenant não encontrado',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      // Validar se o tenant pertence ao usuário (ou se é admin)
      if (tenant.id !== tenantId) {
        return {
          success: false,
          error: 'Acesso negado a este tenant',
          data: null,
          timestamp: new Date().toISOString()
        };
      }
      
      // Converter dados do banco para DTO
      const tenantDTO = {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        email: tenant.email,
        status: tenant.status,
        settings: tenant.settings,
        isActive: tenant.status === 'active',
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString()
      };
      
      return {
        success: true,
        data: tenantDTO,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar tenant:', error);
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
    detail: {
      tags: ['Tenants'],
      summary: 'Buscar tenant por ID',
      description: 'Retorna um tenant específico por ID',
    }
  });