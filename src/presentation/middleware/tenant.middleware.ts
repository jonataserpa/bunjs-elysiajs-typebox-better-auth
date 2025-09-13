import { Elysia } from 'elysia';
import { logger } from '@/infrastructure/logging/Logger';
import { DrizzleTenantRepository } from '@/infrastructure/database/repositories/tenant.repository';

const tenantRepository = new DrizzleTenantRepository();

/**
 * Middleware de validação de tenant
 */
export const tenantMiddleware = new Elysia({ name: 'tenant-middleware' })
  // Temporariamente comentado para corrigir erros de tipagem
  /*
  .derive(async ({ headers, params, query }) => {
    let tenantId: string | null = null;

    // Extrair tenant ID do header, parâmetro ou query
    const tenantHeader = headers['x-tenant-id'];
    const tenantParam = params?.tenantId;
    const tenantQuery = query?.tenantId;

    tenantId = tenantHeader || tenantParam || tenantQuery || null;

    if (!tenantId) {
      return {
        tenant: null,
        tenantId: null,
        error: 'Tenant ID não fornecido'
      };
    }

    try {
      const tenant = await tenantRepository.findById(tenantId);
      
      if (!tenant) {
        return {
          tenant: null,
          tenantId,
          error: 'Tenant não encontrado'
        };
      }

      if (!tenant.isActive) {
        return {
          tenant: null,
          tenantId,
          error: 'Tenant inativo'
        };
      }

      logger.info('Tenant validado', 'TenantMiddleware', {
        tenantId: tenant.id,
        tenantSlug: tenant.slug.getValue(),
        tenantName: tenant.name.getValue()
      });

      return {
        tenant,
        tenantId,
        error: null
      };
    } catch (error) {
      logger.error('Erro ao validar tenant', error as Error, 'TenantMiddleware', { tenantId });
      return {
        tenant: null,
        tenantId,
        error: 'Erro interno ao validar tenant'
      };
    }
  })
  .onRequest(({ tenant, tenantId, error, set }) => {
    if (!tenant) {
      set.status = 400;
      return {
        success: false,
        error: error || 'Tenant inválido',
        timestamp: new Date().toISOString()
      };
    }
  });

/**
 * Middleware de validação de tenant por slug
 */
export const tenantSlugMiddleware = new Elysia({ name: 'tenant-slug-middleware' })
  /*
  .derive(async ({ params, query }) => {
    const slug = params?.slug || query?.tenantSlug;

    if (!slug) {
      return {
        tenant: null,
        tenantSlug: null,
        error: 'Slug do tenant não fornecido'
      };
    }

    try {
      const tenant = await tenantRepository.findBySlug(slug);
      
      if (!tenant) {
        return {
          tenant: null,
          tenantSlug: slug,
          error: 'Tenant não encontrado'
        };
      }

      if (!tenant.isActive) {
        return {
          tenant: null,
          tenantSlug: slug,
          error: 'Tenant inativo'
        };
      }

      return {
        tenant,
        tenantSlug: slug,
        error: null
      };
    } catch (error) {
      logger.error('Erro ao validar tenant por slug', error as Error, 'TenantSlugMiddleware', { slug });
      return {
        tenant: null,
        tenantSlug: slug,
        error: 'Erro interno ao validar tenant'
      };
    }
  })
  .onRequest(({ tenant, tenantSlug, error, set }) => {
    if (!tenant) {
      set.status = 400;
      return {
        success: false,
        error: error || 'Tenant inválido',
        timestamp: new Date().toISOString()
      };
    }
  });

/**
 * Middleware de logging de tenant
 */
export const tenantLoggingMiddleware = new Elysia({ name: 'tenant-logging-middleware' })
  /*
  .onRequest(({ tenant, user, set }) => {
    logger.info('Requisição com tenant', 'TenantLogging', {
      tenantId: tenant?.id || 'unknown',
      tenantSlug: tenant?.slug.getValue() || 'unknown',
      userId: user?.userId || 'anonymous',
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
  });
  */
